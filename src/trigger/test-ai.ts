import { neon } from '@neon/ai-sdk-provider'
import { task } from '@trigger.dev/sdk'
import { generateText } from 'ai'

export const testAi = task({
  id: 'test-ai',
  retry: { maxAttempts: 1 },
  run: async (_payload: Record<string, never>, { signal }) => {
    const { text } = await generateText({
      model: neon('gpt-oss-20b'),
      prompt: 'Write one short, unusual greeting for a developer testing an API.',
      maxOutputTokens: 512,
      maxRetries: 0,
      abortSignal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
    })

    if (!text.trim()) throw new Error('AI returned no text')
    return { text: text.trim() }
  },
})
