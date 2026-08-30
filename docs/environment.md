# Environment configuration

القيم التالية مطلوبة أو اختيارية حسب بيئة التشغيل. لا تضع القيم الحقيقية في GitHub أو في هذا الملف؛ استخدم secret manager أو إعدادات البيئة الخاصة بالاستضافة.

| Variable | Usage | Required |
| --- | --- | --- |
| `NODE_ENV` | `development` أو `production` | Yes |
| `DATABASE_URL` | MySQL/TiDB connection string | Yes |
| `JWT_SECRET` | Session cookie signing secret | Yes |
| `VITE_APP_ID` | Manus OAuth application ID | Yes |
| `OAUTH_SERVER_URL` | OAuth backend base URL | Yes |
| `OWNER_OPEN_ID` | Owner identity used for owner procedures | Yes |
| `BUILT_IN_FORGE_API_URL` | Server-side built-in forge endpoint for try-on | Yes |
| `BUILT_IN_FORGE_API_KEY` | Server-side forge credential | Yes |
| `VITE_FRONTEND_FORGE_API_URL` | Optional frontend forge endpoint | Optional |
| `VITE_FRONTEND_FORGE_API_KEY` | Optional frontend forge credential | Optional |
| `VITE_APP_TITLE` | Hosting-managed website title | Optional |
| `VITE_APP_LOGO` | Hosting-managed logo value | Optional |
| `VITE_ANALYTICS_ENDPOINT` | First-party analytics endpoint when configured | Optional |
| `VITE_ANALYTICS_WEBSITE_ID` | First-party analytics website identifier | Optional |
| `VITE_OAUTH_PORTAL_URL` | OAuth login portal URL | Optional |

A local developer may create a private `.env` file from these names, but `.env` must remain untracked. Never commit `DATABASE_URL`, JWT values, OAuth credentials, forge keys, Shopify tokens, payment-provider credentials, WhatsApp Business credentials, customer information, or production exports. The current runtime intentionally does not enable card payments, Paymob/Stripe, or WhatsApp Business API.

The source of truth for server-side environment mapping is `server/_core/env.ts`. Hosting-managed values may be injected by the deployment platform and do not need to be committed to the repository.
