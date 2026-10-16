<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCommentDots, faLocationDot, faPaperPlane, faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { ChatMessage, Stop } from '../../shared/types'
import { streamChat } from '../services/api'
import { useTrip } from '../composables/useTrip'

interface UiMessage {
  role: 'user' | 'assistant'
  content: string
  /** AI 在地圖上標示的站點，顯示成可點的標籤 */
  stopIds?: number[]
  error?: boolean
  pending?: boolean
}

const props = defineProps<{ tripId: string }>()
const { trip, selectedStop, selectStop, highlightStops, clearHighlights } = useTrip()

const SUGGESTIONS = ['第一天怎麼安排比較順？', '一點心推薦點什麼？', '哪些景點可以用 FunPASS？']
const WELCOME = '嗨！我是行程小幫手，可以問我任何站點或行程的問題，提到的地點會幫你標在地圖上。'
// 比伺服器的上限稍長，伺服器沒回應時前端也一定會結束等待
const CLIENT_TIMEOUT_MS = 100_000

const open = ref(false)
const input = ref('')
const sending = ref(false)
const mock = ref(false)
const log = ref<HTMLDivElement>()
const messages = ref<UiMessage[]>([{ role: 'assistant', content: WELCOME }])
const showSuggestions = computed(() => messages.value.length === 1 && !sending.value)

/** 進行中的請求；重新整理對話時用來中斷 */
let controller: AbortController | null = null

const stopById = (id: number) => trip.value?.stops.find(s => s.id === id)

/** 把 **粗體** 拆成片段，用 <strong> 顯示（不使用 v-html，避免插入 HTML） */
function segments(text: string): { text: string; bold: boolean }[] {
  return text
    .trim()
    .split(/(\*\*[^*\n]+\*\*)/)
    .filter(Boolean)
    .map(part =>
      part.startsWith('**') && part.endsWith('**') && part.length > 4
        ? { text: part.slice(2, -2), bold: true }
        : { text: part, bold: false },
    )
}

async function scrollToBottom() {
  await nextTick()
  log.value?.scrollTo({ top: log.value.scrollHeight })
}

async function ask(text: string) {
  const question = text.trim()
  if (!question || sending.value) return
  // 送給後端的對話：去掉歡迎詞、錯誤訊息與空回覆
  const history: ChatMessage[] = messages.value
    .slice(1)
    .filter(m => !m.error && m.content.trim())
    .map(m => ({ role: m.role, content: m.content }))
  history.push({ role: 'user', content: question })

  messages.value.push({ role: 'user', content: question })
  messages.value.push({ role: 'assistant', content: '', pending: true })
  // 從陣列取回響應式的那一份，後續更新才會即時反映在畫面上
  const msg = messages.value[messages.value.length - 1]
  input.value = ''
  sending.value = true
  clearHighlights()
  await scrollToBottom()

  const current = new AbortController()
  controller = current
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    current.abort()
  }, CLIENT_TIMEOUT_MS)

  try {
    await streamChat(
      { tripId: props.tripId, messages: history, focusStopId: selectedStop.value?.id },
      event => {
        if (event.type === 'text') {
          msg.content += event.delta
          scrollToBottom()
        } else if (event.type === 'reset') {
          msg.content = ''
        } else if (event.type === 'highlight') {
          msg.stopIds = [...new Set([...(msg.stopIds ?? []), ...event.stopIds])]
          highlightStops(msg.stopIds)
        } else if (event.type === 'done') {
          mock.value = Boolean(event.mock)
        } else if (event.type === 'error') {
          msg.content = event.message
          msg.error = true
        }
      },
      current.signal,
    )
    if (!msg.content.trim() && !msg.error) {
      msg.content = '抱歉，這次沒有產生回覆，請再問一次。'
      msg.error = true
    }
  } catch (e) {
    // 使用者按了重新整理：這則訊息已經清掉，不用顯示錯誤
    if (current.signal.aborted && !timedOut) return
    msg.content = timedOut ? 'AI 回覆逾時，請再問一次。' : e instanceof Error ? e.message : '發生錯誤，請稍後再試。'
    msg.error = true
  } finally {
    clearTimeout(timer)
    // 只有仍是目前這個請求時才解除「傳送中」，避免蓋掉重新整理後的新狀態
    if (controller === current) {
      controller = null
      msg.pending = false
      sending.value = false
      await scrollToBottom()
    }
  }
}

/** 重新整理對話：中斷進行中的回覆、清空訊息與地圖標示 */
function resetChat() {
  controller?.abort()
  controller = null
  sending.value = false
  input.value = ''
  messages.value = [{ role: 'assistant', content: WELCOME }]
  clearHighlights()
}

/** 點 AI 回覆下方的站點標籤：打開詳情並捲到地圖 */
function openStop(stop: Stop) {
  selectStop(stop)
  document.querySelector('.trip-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div v-if="open" class="chat-panel">
    <header>
      <span class="chat-title">
        Trip Buddy
        <small>AI 行程助理<template v-if="mock">・示範回覆</template></small>
      </span>
      <button
        type="button"
        class="chat-reset"
        title="重新開始對話"
        aria-label="重新開始對話"
        :disabled="messages.length === 1 && !sending"
        @click="resetChat"
      ><FontAwesomeIcon :icon="faRotateRight" /></button>
    </header>
    <div ref="log" class="chat-log" aria-live="polite">
      <div v-for="(m, i) in messages" :key="i" class="msg" :class="[m.role, { error: m.error }]">
        <span v-if="m.pending && !m.content" class="typing" aria-label="回覆中"><i></i><i></i><i></i></span>
        <template v-else>
          <template v-for="(seg, j) in segments(m.content)" :key="j">
            <strong v-if="seg.bold">{{ seg.text }}</strong>
            <template v-else>{{ seg.text }}</template>
          </template>
        </template>
        <div v-if="m.stopIds?.length" class="msg-stops">
          <template v-for="id in m.stopIds" :key="id">
            <button v-if="stopById(id)" type="button" @click="openStop(stopById(id)!)">
              <FontAwesomeIcon :icon="faLocationDot" /> {{ stopById(id)!.name }}
            </button>
          </template>
        </div>
      </div>
      <div v-if="showSuggestions" class="suggestions">
        <button v-for="s in SUGGESTIONS" :key="s" type="button" @click="ask(s)">{{ s }}</button>
      </div>
    </div>
    <form class="chat-form" @submit.prevent="ask(input)">
      <input v-model="input" placeholder="例如：一點心推薦點什麼？" maxlength="500" />
      <button :disabled="sending || !input.trim()" aria-label="送出"><FontAwesomeIcon :icon="faPaperPlane" /></button>
    </form>
  </div>
  <button class="chat-fab" :aria-expanded="open" @click="open = !open">
    <FontAwesomeIcon :icon="open ? faXmark : faCommentDots" />
    {{ open ? '關閉' : '問 AI' }}
  </button>
</template>
