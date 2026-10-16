// 檢查 AI 助理的金鑰是否可用。只查詢帳號與模型資訊，不產生用量。
// 用法：npm run check-key
import { existsSync } from 'node:fs'

if (existsSync('.env')) process.loadEnvFile('.env')
const provider = process.env.AGENT_PROVIDER === 'anthropic' ? 'anthropic' : 'cursor'
console.log(`供應商：${provider}`)
process.exitCode = 1

if (provider === 'cursor') await checkCursor()
else await checkAnthropic()

async function checkCursor() {
  const apiKey = process.env.CURSOR_API_KEY
  const model = process.env.CURSOR_MODEL || 'composer-2.5'
  if (!apiKey) return console.error('✗ 尚未設定金鑰：在專案根目錄的 .env 加上 CURSOR_API_KEY=你的金鑰')

  const sdk = await import('@cursor/sdk')
  try {
    const me = await sdk.Cursor.me({ apiKey })
    console.log(`✓ 金鑰可用（${me.apiKeyName}）`)
    const models = await sdk.Cursor.models.list({ apiKey })
    const isCurrent = m => m.id === model || m.aliases?.includes(model)
    console.log('\n可用模型（設定在 CURSOR_MODEL）：')
    for (const m of models) console.log(` ${isCurrent(m) ? '→' : ' '} ${m.id.padEnd(32)} ${m.displayName}`)
    if (!models.some(isCurrent)) return console.error(`\n✗ 目前的 CURSOR_MODEL「${model}」不在清單中，請改成上面其中一個 id。`)
    process.exitCode = 0
  } catch (err) {
    if (err instanceof sdk.AuthenticationError) console.error('✗ 金鑰無效、已過期或已被撤銷，請到 Cursor Dashboard 重新產生。')
    else if (err instanceof sdk.NetworkError) console.error('✗ 無法連線，請檢查網路或 proxy 設定。')
    else throw err
  }
}

async function checkAnthropic() {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const model = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5'
  try {
    const info = await new Anthropic().models.retrieve(model)
    console.log(`✓ 金鑰可用，模型 ${info.display_name}（${info.id}）`)
    process.exitCode = 0
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) console.error('✗ 金鑰無效或尚未設定 ANTHROPIC_API_KEY。')
    else throw err
  }
}
