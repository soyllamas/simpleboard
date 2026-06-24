# SimpleBoard

## Setup

Install dependencies:

```bash
npm install
```

Create a local env file from `.env.example`.

`FIREBASE_SERVICE_ACCOUNT` is the base64-encoded Firebase Admin service account JSON.

`PUBLIC_FIREBASE_CONFIG` is the base64-encoded Firebase web config JSON.

`PUBLIC_FIREBASE_APP_CHECK_SITE_KEY` enables Firebase App Check for browser Firebase calls using reCAPTCHA Enterprise. Leave it empty for local development when App Check enforcement is not required.

For local or CI App Check testing, set `PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN=true` to have Firebase log a debug token, then register that token in the Firebase console. To reuse a registered token, set the variable to the token value. Do not commit real debug tokens.

## Developing

```bash
npm run dev
```

## Building

```bash
npm run build
```
