# daysoff

Vacation bridge calculator — find the optimal combination of PTO days to maximize consecutive time off by leveraging public holidays and weekends.

## Tech stack

- [Astro](https://astro.build) (SSG) as the base framework
- React for the interactive calculator island
- Tailwind CSS for styling
- TypeScript throughout, strict mode
- No backend, no database — holiday data ships as static JSON in `src/lib/holidays/`
- [Vitest](https://vitest.dev) for unit tests

## Setup

```bash
pnpm install
pnpm dev       # start the dev server
pnpm lint      # eslint --fix
pnpm test      # vitest run
pnpm build     # astro check && astro build
```

Node version is pinned in `.nvmrc` (22). Package manager is pnpm, pinned via the `packageManager` field in `package.json`.

## Project structure

- `src/pages/index.astro` — main page, renders the calculator island
- `src/components/Calculator.tsx` — the interactive React island (`client:load`)
- `src/lib/holidays/` — static JSON holiday data, one file per country/region/year
- `src/lib/optimizer.ts` — pure TypeScript module with the calendar/bridge-finding logic
- `src/lib/optimizer.test.ts` — unit tests for the optimizer (Vitest)

## Algorithm status

`buildCalendar()` builds a day-by-day calendar for a given year, tagging each day as `holiday`, `weekend`, or `workday` from the resolved holiday list.

`findBridges()` — the actual gap-detection, efficiency ranking, and greedy multi-gap combination described in the project spec — is **not implemented yet**. It's currently a stub that returns no candidates; this scaffold focused on getting the project tooling (build/lint/test, Husky hooks, CI) working end to end first.

Holiday data currently ships only a national-holidays starter file for Spain 2026 (`src/lib/holidays/es-2026.json`). Autonomous-community holidays and additional years are not yet included — verify against the official BOE calendar before relying on this data.

## Git hooks (Husky)

- `pre-commit` runs `lint-staged` (Prettier + ESLint `--fix` on staged `.ts`/`.tsx`/`.astro` files).
- `pre-push` runs `pnpm build && pnpm test`.

Hooks are installed automatically via the `prepare` script on `pnpm install`. Set `HUSKY=0` to skip hook installation (e.g. in CI).

## CI

`.github/workflows/ci.yml` runs lint, test, and build on every pull request via the shared [`sisques-labs/workflows`](https://github.com/sisques-labs/workflows) `node-ci.yml` reusable workflow.
