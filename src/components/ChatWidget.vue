<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCommentDots, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { ChatMessage } from '../../shared/types'
import { sendChat } from '../services/api'
import { useTrip } from '../composables/useTrip'

const props = defineProps<{ tripId: string }>()
const { selectedStop } = useTrip()

const open = ref(false)
const input = ref('')
const sending = ref(false)
const log = ref<HTMLDivElement>()
const messages = ref<ChatMessage[]>([
  { role: 'assistant', content: '嗨！我是行程小幫手，可以問我任何站點或行程的問題。' },
])

async function submit() {
  const text = input.value.trim()
  if (!text || sending.value) return
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  sending.value = true
  try {
    const res = await sendChat({
      tripId: props.tripId,
      // 第一則是前端的歡迎詞，不送給後端
      messages: messages.value.slice(1),
      focusStopId: selectedStop.value?.id,
    })
    messages.value.push({ role: 'assistant', content: res.reply })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    messages.value.push({ role: 'assistant', content: `發生錯誤：${msg}` })
  } finally {
    sending.value = false
    await nextTick()
    log.value?.scrollTo({ top: log.value.scrollHeight })
  }
}
</script>

<template>
  <div v-if="open" class="chat-panel">
    <header>Trip Buddy <small>AI 行程助理・示範回覆</small></header>
    <div ref="log" class="chat-log">
      <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">{{ m.content }}</div>
    </div>
    <form class="chat-form" @submit.prevent="submit">
      <input v-model="input" placeholder="例如：一點心要點什麼？" />
      <button :disabled="sending">送出</button>
    </form>
  </div>
  <button class="chat-fab" :aria-expanded="open" @click="open = !open">
    <FontAwesomeIcon :icon="open ? faXmark : faCommentDots" />
    {{ open ? '關閉' : '問 AI' }}
  </button>
</template>
