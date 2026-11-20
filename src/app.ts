import { timingSafeEqual } from 'node:crypto'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

type TelegramMessage = {
  message_id?: number
  chat?: { id?: number }
  is_topic_message?: boolean
  message_thread_id?: number
}

app.post('/telegram/webhook', async (c) => {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const secret = process.env.TELEGRAME_WEBHOOK_SECRET
  if (!token || !secret) return c.text('Webhook unavailable', 503)

  const supplied = Buffer.from(c.req.header('X-Telegram-Bot-Api-Secret-Token') ?? '')
  const expected = Buffer.from(secret)
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return c.text('Unauthorized', 401)
  }

  let update: { message?: TelegramMessage } | null
  try {
    update = await c.req.json()
  } catch {
    return c.text('Invalid JSON', 400)
  }

  const message = update?.message
  if (!message) return c.body(null, 204)

  const chatId = message.chat?.id
  if (!Number.isSafeInteger(chatId) || !Number.isSafeInteger(message.message_id)) {
    return c.text('Invalid message', 400)
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/copyMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        from_chat_id: chatId,
        message_id: message.message_id,
        message_thread_id: message.is_topic_message ? message.message_thread_id : undefined,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (response.ok || response.status === 400 || response.status === 403) {
      // Telegram may reject non-copyable messages or revoke access to the chat.
      await response.body?.cancel()
      return c.body(null, 204)
    }
    await response.body?.cancel()
    console.error('Telegram copyMessage failed with status', response.status)
  } catch {
    console.error('Telegram copyMessage request failed')
  }

  return c.text('Telegram API unavailable', 502)
})

export default app
