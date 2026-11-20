import { timingSafeEqual } from 'node:crypto'
import { neon } from '@neon/ai-sdk-provider'
import { generateText } from 'ai'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

type TelegramMessage = {
  chat?: { id?: number }
  text?: string
  caption?: string
  is_topic_message?: boolean
  message_thread_id?: number
}

app.post('/telegram/webhook', async (c) => {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const secret = process.env.TELEGRAME_WEBHOOK_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET
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
  if (!Number.isSafeInteger(chatId)) {
    return c.text('Invalid message', 400)
  }

  const prompt = (message.text ?? message.caption)?.trim()
  let reply = 'Envoie-moi un message texte ou ajoute une légende pour que je puisse te répondre.'
  if (prompt) {
    if (!process.env.NEON_AI_GATEWAY_BASE_URL || !process.env.NEON_AI_GATEWAY_TOKEN) {
      return c.text('AI Gateway unavailable', 503)
    }

    try {
      const { text } = await generateText({
        model: neon('gpt-oss-20b'),
        instructions: 'Reply concisely in the language of the user. Use plain text suitable for Telegram.',
        prompt,
        maxOutputTokens: 1024,
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(12000),
      })
      reply = text.trim().slice(0, 4096).toWellFormed() || 'Je n’ai pas pu générer de réponse. Essaie de reformuler ton message.'
    } catch {
      console.error('Neon AI Gateway generation failed')
      return c.text('AI Gateway unavailable', 502)
    }
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply,
        message_thread_id: message.is_topic_message ? message.message_thread_id : undefined,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (response.ok || response.status === 400 || response.status === 403) {
      // A rejected message or an inaccessible chat will not recover by retrying.
      await response.body?.cancel()
      return c.body(null, 204)
    }
    await response.body?.cancel()
    console.error('Telegram sendMessage failed with status', response.status)
  } catch {
    console.error('Telegram sendMessage request failed')
  }

  return c.text('Telegram API unavailable', 502)
})

export default app
