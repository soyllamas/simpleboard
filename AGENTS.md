# SimpleBoard

SvelteKit 5 + Firebase app using Bun runtime. Deployed to Cloud Run via GitHub Actions.

## Stack

- **Framework:** SvelteKit 2 / Svelte 5
- **Runtime:** Bun (never use npm)
- **Backend:** Firebase (client SDK + Admin SDK)
- **Styling:** Tailwind CSS 4
- **Validation:** Valibot
- **Testing:** Vitest (unit), Playwright (integration)
- **Adapter:** svelte-adapter-bun

## Commands

- `bun install` — install dependencies
- `bun run dev` — start dev server
- `bun run build` — production build
- `bun run test` — run Vitest
- `bun run test:e2e` — run Playwright

## Architecture

Domain-Driven Design with Clean Architecture:

```
src/lib/domain/entity/    — domain entities
src/lib/domain/useCase/   — business logic
src/lib/client/           — client-side infrastructure (Firebase)
src/lib/server/           — server-side infrastructure (Firebase Admin)
src/lib/components/       — UI components
src/routes/               — SvelteKit routes and server logic
```

## Rules

See `.agents/rules/` for detailed guidelines:

- `general.md` — project-specific rules (bun usage)
- `conventions.md` — code style conventions
- `software-design.md` — architectural principles
- `btca.md` — btca CLI tool usage
