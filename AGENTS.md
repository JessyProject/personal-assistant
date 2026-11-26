## Hono CLI

Run `npx hono --help` first, and use the CLI instead of a dev server.

<!-- TRIGGER.DEV SKILLS START -->
## Trigger.dev agent skills

This project has Trigger.dev agent skills installed in `.agents/skills/`. Before writing or changing Trigger.dev code (background tasks, scheduled tasks, realtime, or chat.agent AI agents), load the most relevant skill: `trigger-authoring-chat-agent`, `trigger-authoring-tasks`, `trigger-chat-agent-advanced`, `trigger-cost-savings`, `trigger-getting-started`, `trigger-realtime-and-frontend`.
<!-- TRIGGER.DEV SKILLS END -->

## Railway environment variable sync

When using the `use-railway` skill to sync environment variables, always exclude `TRIGGER_SECRET_KEY`, including from bulk imports. The local `.env` value is for Trigger.dev development. Preserve the existing Railway value and manage production key changes only on explicit request.
