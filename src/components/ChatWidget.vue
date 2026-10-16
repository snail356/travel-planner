<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faLocationDot,
  faPaperPlane,
  faRotateRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import AiBotIcon from "./icons/AiBotIcon.vue";
import type { ChatMessage, Stop } from "../../shared/types";
import { streamChat } from "../services/api";
import { dayStyle, useTrip } from "../composables/useTrip";
import { useExchangeRate } from "../composables/useExchangeRate";
import {
  type ConversionRequest,
  formatConversion,
  parseConversion,
} from "../utils/currency";

interface UiMessage {
  role: "user" | "assistant";
  content: string;
  /** AI 在地圖上標示的站點，顯示成可點的標籤 */
  stopIds?: number[];
  error?: boolean;
  pending?: boolean;
  /** 前端直接回答（例如匯率換算），不送進 AI 的對話紀錄 */
  local?: boolean;
  /** 讓使用者挑選的餐廳（選完後 picked 會記下選了哪一間，選項就不能再按） */
  restaurantChoices?: number[];
  picked?: number;
}

const props = defineProps<{ tripId: string }>();
const {
  trip,
  orderedStops,
  selectedStop,
  selectStop,
  highlightStops,
  clearHighlights,
} = useTrip();

/** 常駐在輸入框上方的快捷問題；rate 為前端直接換算，不呼叫 AI */
const QUICK: {
  label: string;
  text?: string;
  rate?: true;
  restaurants?: true;
}[] = [
  { label: "匯率換算", rate: true },
  { label: "餐廳推薦什麼？", restaurants: true },
  { label: "第一天怎麼走？", text: "第一天怎麼安排比較順？" },
  { label: "需要辦簽證嗎？", text: "去香港需要辦簽證嗎？" },
  { label: "FunPASS 怎麼預約？", text: "FunPASS 的景點要怎麼預約？" },
];
const WELCOME =
  "嗨！我是行程小幫手，可以問我任何站點或行程的問題，提到的地點會幫你標在地圖上。也可以直接輸入「100 港幣」幫你換算台幣。";
// 比伺服器的上限稍長，伺服器沒回應時前端也一定會結束等待
const CLIENT_TIMEOUT_MS = 100_000;

const open = ref(false);
// 關閉對話框時清除 AI 在地圖上的標示，地圖回到原本的樣子
watch(open, (isOpen) => {
  if (!isOpen) clearHighlights();
});
const input = ref("");
const sending = ref(false);
const mock = ref(false);
const log = ref<HTMLDivElement>();
const messages = ref<UiMessage[]>([{ role: "assistant", content: WELCOME }]);
/** 剛按過「匯率換算」：下一則若只輸入數字，視為港幣 */
const rateMode = ref(false);
const {
  info: rateInfo,
  updatedLabel: rateUpdated,
  load: loadRate,
} = useExchangeRate();

/** 進行中的請求；重新整理對話時用來中斷 */
let controller: AbortController | null = null;

const stopById = (id: number) => trip.value?.stops.find((s) => s.id === id);

/** 把 **粗體** 拆成片段，用 <strong> 顯示（不使用 v-html，避免插入 HTML） */
function segments(text: string): { text: string; bold: boolean }[] {
  return text
    .trim()
    .split(/(\*\*[^*\n]+\*\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4
        ? { text: part.slice(2, -2), bold: true }
        : { text: part, bold: false },
    );
}

async function scrollToBottom() {
  await nextTick();
  log.value?.scrollTo({ top: log.value.scrollHeight });
}

/** 前端直接回答一則（不呼叫 AI，也不進 AI 的對話紀錄） */
async function replyLocally(
  question: string,
  answer: () => Promise<{ text: string; error?: boolean }>,
) {
  messages.value.push({ role: "user", content: question, local: true });
  input.value = "";
  const { text, error } = await answer();
  messages.value.push({ role: "assistant", content: text, local: true, error });
  await scrollToBottom();
}

async function currentRate() {
  return rateInfo.value ?? (await loadRate());
}

function rateNote() {
  const r = rateInfo.value!;
  return `參考匯率 1 HKD = ${r.rate.toFixed(4)} TWD・${rateUpdated.value}${r.fallback ? "（備用值）" : ""}`;
}

/** 快捷鍵「匯率換算」：直接回覆目前匯率，並等使用者輸入金額 */
function askRate() {
  rateMode.value = true;
  return replyLocally("匯率換算", async () => {
    if (!(await currentRate()))
      return {
        text: "暫時無法取得匯率，請稍後再試，或使用「行前須知」裡的匯率計算機。",
        error: true,
      };
    const example = formatConversion(
      { amount: 100, from: "HKD" },
      rateInfo.value!.rate,
    );
    return {
      text: [
        rateNote(),
        example,
        "",
        "直接輸入金額，例如「200」（港幣）或「500 台幣」，我馬上幫你換算。實際換匯或刷卡的匯率會略差一些。",
      ].join("\n"),
    };
  });
}

/** 換算金額：依最新參考匯率在前端計算 */
function convertLocally(question: string, req: ConversionRequest) {
  return replyLocally(question, async () => {
    if (!(await currentRate()))
      return { text: "暫時無法取得匯率，請稍後再試。", error: true };
    return {
      text: `${formatConversion(req, rateInfo.value!.rate)}
${rateNote()}`,
    };
  });
}

/** 快捷鍵「餐廳推薦什麼？」：先列出行程中的餐廳讓使用者挑選 */
async function askRestaurant() {
  rateMode.value = false;
  messages.value.push({ role: "user", content: "餐廳推薦什麼？", local: true });
  messages.value.push({
    role: "assistant",
    content: "想問哪一間餐廳呢？",
    local: true,
    restaurantChoices: orderedStops.value
      .filter((s) => s.type === "food")
      .map((s) => s.id),
  });
  await scrollToBottom();
}

/** 選了餐廳：記下選擇，再請 AI 推薦（並告訴 AI 是哪一站） */
function pickRestaurant(m: UiMessage, id: number) {
  const stop = stopById(id);
  if (!stop || sending.value || m.picked) return;
  m.picked = id;
  ask(`${stop.name}推薦點什麼？`, id);
}

/** 依天數分組餐廳選項，例如 Day 1：一點心、霸王茶姬… */
function choicesByDay(ids: number[]) {
  const groups: { day: Stop["day"]; stops: Stop[] }[] = [];
  for (const id of ids) {
    const stop = stopById(id);
    if (!stop) continue;
    const group = groups.at(-1);
    if (group?.day === stop.day) group.stops.push(stop);
    else groups.push({ day: stop.day, stops: [stop] });
  }
  return groups;
}

function pickQuick(q: (typeof QUICK)[number]) {
  if (sending.value) return;
  if (q.rate) askRate();
  else if (q.restaurants) askRestaurant();
  else if (q.text) ask(q.text);
}

/** focusStopId：問題指的是哪一站（預設為目前在詳情面板開啟的站點） */
async function ask(text: string, focusStopId = selectedStop.value?.id) {
  const question = text.trim();
  if (!question || sending.value) return;
  // 匯率換算不必問 AI，直接依最新匯率計算
  const conversion = parseConversion(question, rateMode.value);
  if (conversion) return convertLocally(question, conversion);
  rateMode.value = false;
  // 送給後端的對話：去掉歡迎詞、錯誤訊息與空回覆
  const history: ChatMessage[] = messages.value
    .slice(1)
    .filter((m) => !m.error && !m.local && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content }));
  history.push({ role: "user", content: question });

  messages.value.push({ role: "user", content: question });
  messages.value.push({ role: "assistant", content: "", pending: true });
  // 從陣列取回響應式的那一份，後續更新才會即時反映在畫面上
  const msg = messages.value[messages.value.length - 1];
  input.value = "";
  sending.value = true;
  clearHighlights();
  await scrollToBottom();

  const current = new AbortController();
  controller = current;
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    current.abort();
  }, CLIENT_TIMEOUT_MS);

  try {
    await streamChat(
      { tripId: props.tripId, messages: history, focusStopId },
      (event) => {
        if (event.type === "text") {
          msg.content += event.delta;
          scrollToBottom();
        } else if (event.type === "reset") {
          msg.content = "";
        } else if (event.type === "highlight") {
          msg.stopIds = [
            ...new Set([...(msg.stopIds ?? []), ...event.stopIds]),
          ];
          // 對話框已關閉就不再標示（避免關閉後回覆才到，又把地圖標上）
          if (open.value) highlightStops(msg.stopIds);
        } else if (event.type === "done") {
          mock.value = Boolean(event.mock);
        } else if (event.type === "error") {
          msg.content = event.message;
          msg.error = true;
        }
      },
      current.signal,
    );
    if (!msg.content.trim() && !msg.error) {
      msg.content = "抱歉，這次沒有產生回覆，請再問一次。";
      msg.error = true;
    }
  } catch (e) {
    // 使用者按了重新整理：這則訊息已經清掉，不用顯示錯誤
    if (current.signal.aborted && !timedOut) return;
    msg.content = timedOut
      ? "AI 回覆逾時，請再問一次。"
      : e instanceof Error
        ? e.message
        : "發生錯誤，請稍後再試。";
    msg.error = true;
  } finally {
    clearTimeout(timer);
    // 只有仍是目前這個請求時才解除「傳送中」，避免蓋掉重新整理後的新狀態
    if (controller === current) {
      controller = null;
      msg.pending = false;
      sending.value = false;
      await scrollToBottom();
    }
  }
}

/** 重新整理對話：中斷進行中的回覆、清空訊息與地圖標示 */
function resetChat() {
  controller?.abort();
  controller = null;
  sending.value = false;
  rateMode.value = false;
  input.value = "";
  messages.value = [{ role: "assistant", content: WELCOME }];
  clearHighlights();
}

/** 點 AI 回覆下方的站點標籤：打開詳情並捲到地圖 */
function openStop(stop: Stop) {
  selectStop(stop);
  document
    .querySelector(".trip-map")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}
</script>

<template>
  <!-- 開關動畫：從右下角的按鈕位置放大淡入 -->
  <Transition name="chat-pop">
    <div v-if="open" class="chat-panel">
      <header>
        <span class="chat-title">
          Trip Buddy
          <small>AI 行程助理<template v-if="mock">・示範回覆</template></small>
        </span>
        <span class="chat-actions">
          <button
            type="button"
            class="chat-reset"
            title="重新開始對話"
            aria-label="重新開始對話"
            :disabled="messages.length === 1 && !sending"
            @click="resetChat"
          >
            <FontAwesomeIcon :icon="faRotateRight" />
          </button>
          <button
            type="button"
            class="chat-reset"
            title="關閉"
            aria-label="關閉 AI 行程助理"
            @click="open = false"
          >
            <FontAwesomeIcon :icon="faXmark" />
          </button>
        </span>
      </header>
      <div ref="log" class="chat-log" aria-live="polite">
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="msg"
          :class="[m.role, { error: m.error }]"
        >
          <span
            v-if="m.pending && !m.content"
            class="typing"
            aria-label="回覆中"
            ><i></i><i></i><i></i
          ></span>
          <template v-else>
            <template v-for="(seg, j) in segments(m.content)" :key="j">
              <strong v-if="seg.bold">{{ seg.text }}</strong>
              <template v-else>{{ seg.text }}</template>
            </template>
          </template>
          <div v-if="m.restaurantChoices?.length" class="msg-choices">
            <div
              v-for="group in choicesByDay(m.restaurantChoices)"
              :key="group.day"
              class="choice-day"
            >
              <span class="choice-day-label" :style="dayStyle(group.day)"
                >Day {{ group.day }}</span
              >
              <button
                v-for="stop in group.stops"
                :key="stop.id"
                type="button"
                :class="{ picked: m.picked === stop.id }"
                :disabled="!!m.picked || sending"
                @click="pickRestaurant(m, stop.id)"
              >
                {{ stop.name }}
              </button>
            </div>
          </div>
          <div v-if="m.stopIds?.length" class="msg-stops">
            <template v-for="id in m.stopIds" :key="id">
              <button
                v-if="stopById(id)"
                type="button"
                @click="openStop(stopById(id)!)"
              >
                <FontAwesomeIcon :icon="faLocationDot" />
                {{ stopById(id)!.name }}
              </button>
            </template>
          </div>
        </div>
      </div>
      <div class="chat-quick" role="group" aria-label="快捷問題">
        <button
          v-for="q in QUICK"
          :key="q.label"
          type="button"
          :class="{ local: q.rate }"
          :disabled="sending"
          @click="pickQuick(q)"
        >
          {{ q.label }}
        </button>
      </div>
      <form class="chat-form" @submit.prevent="ask(input)">
        <input
          v-model="input"
          placeholder="例如：一點心推薦點什麼？"
          maxlength="500"
        />
        <button :disabled="sending || !input.trim()" aria-label="送出">
          <FontAwesomeIcon :icon="faPaperPlane" />
        </button>
      </form>
    </div>
  </Transition>
  <button
    class="chat-fab"
    :class="{ open }"
    :aria-expanded="open"
    :aria-label="open ? '關閉 AI 行程助理' : '開啟 AI 行程助理'"
    :title="open ? '關閉 AI 行程助理' : 'AI 行程助理'"
    @click="open = !open"
  >
    <span class="fab-icon">
      <Transition name="icon-swap" mode="out-in">
        <span v-if="!open" key="ai" class="fab-ai">
          <AiBotIcon :size="26" color="#fff" />
        </span>
        <FontAwesomeIcon v-else key="close" :icon="faXmark" />
      </Transition>
    </span>
  </button>
</template>
