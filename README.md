```
npm install
npm run dev
```

```
open http://localhost:3000
```

## Webhook Telegram

Configurez `TELEGRAM_BOT_TOKEN` et `TELEGRAME_WEBHOOK_SECRET` dans `.env` en local ou dans les variables d’environnement de l’hébergeur. Le secret doit contenir de 1 à 256 caractères parmi `A-Z`, `a-z`, `0-9`, `_` et `-`.

Une fois l’application accessible en HTTPS, appelez la méthode Telegram [`setWebhook`](https://core.telegram.org/bots/api#setwebhook) avec l’URL publique terminée par `/telegram/webhook`, la valeur de `TELEGRAME_WEBHOOK_SECRET` dans `secret_token` et `allowed_updates` égal à `["message"]`.

Configurez également `NEON_AI_GATEWAY_BASE_URL` et `NEON_AI_GATEWAY_TOKEN`. Le bot utilise `gpt-oss-20b` via Neon AI Gateway pour répondre au texte des messages et aux légendes. Pour un média sans légende, il invite l’utilisateur à envoyer du texte.
