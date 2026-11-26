import { task } from '@trigger.dev/sdk'

export const helloWorld = task({
  id: 'hello-world',
  run: async (payload: { name?: string }) => {
    return { greeting: `Hello, ${payload.name?.trim() || 'world'}!` }
  },
})
