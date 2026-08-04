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
- `src/lib/holidays/` — static JSON holiday data, one file per country/year (`es-2026.json`); `registry.ts` resolves a region into a merged, ranked `Holiday[]`
- `src/lib/optimizer.ts` — pure TypeScript module with the calendar/bridge-finding logic
- `src/lib/optimizer.spec.ts` — unit tests for the optimizer (Vitest)

## Algorithm

1. `buildCalendar(year, holidays)` builds a day-by-day calendar for a given year, tagging each day as `holiday`, `weekend`, or `workday` from the resolved holiday list.
2. `findBridges(calendar, availableDays)` scans the calendar for every maximal run of consecutive workdays no longer than `availableDays`, then expands each run outward over the adjacent holidays/weekends to get the full stretch of time off it buys (`ptoUsed`, `totalDaysOff`, `efficiency = totalDaysOff / ptoUsed`). Candidates are ranked by efficiency descending, then `totalDaysOff` descending.
3. `combineBridges(candidates, availableDays)` greedily picks non-overlapping candidates in that ranked order, up to the `availableDays` budget — not a perfect knapsack solve, per the MVP spec.

The `Calculator` island wires this up: a region/year/available-days form drives the calculation, the ranked list shows individual bridges plus the greedy combined plan, and a month-grid calendar highlights holidays, weekends, and the suggested PTO days for the top result.

Holiday data (national + all 17 autonomous communities, 2026) lives in a single `src/lib/holidays/es-2026.json`: `national` holidays are listed once, and each entry under `regions` only carries the delta it adds on top — its own regional days, plus substitute days for a national holiday that region observes (moving a holiday off a Sunday is a per-region decision, not a national one). `registry.ts` merges `national + regions[slug].holidays` into the flat, sorted `Holiday[]` the rest of the app consumes. This mirrors how the [`date-holidays`](https://www.npmjs.com/package/date-holidays) npm package — used to generate this data rather than typing it by hand — structures its own per-country data file. Cross-checked against several regions (Madrid, Cataluña, País Vasco, Galicia) against known official dates, but still verify against the official BOE calendar before relying on this data in production. Local/municipal holidays are explicitly out of scope.

## Git hooks (Husky)

- `pre-commit` runs `lint-staged` (Prettier + ESLint `--fix` on staged `.ts`/`.tsx`/`.astro` files).
- `pre-push` runs `pnpm build && pnpm test:changed`.

Hooks are installed automatically via the `prepare` script on `pnpm install`. Set `HUSKY=0` to skip hook installation (e.g. in CI).

## CI

- `.github/workflows/ci.yml` — lint, test, and build on every pull request via the shared [`sisques-labs/workflows`](https://github.com/sisques-labs/workflows) `node-ci.yml` reusable workflow.
- `.github/workflows/codeql.yml` — CodeQL analysis on push to `develop`/`staging`/`main`, on pull requests, and weekly.
- `.github/workflows/docker.yml` — Docker smoke build (multi-arch, no push) plus a blocking Trivy scan on every pull request.
- `.github/workflows/pr-labeler.yml` — labels pull requests by changed files, per `.github/labeler.yml`.

## Docker

The app is a static build served by nginx. Build and run locally:

```bash
docker build -t daysoff .
docker run -p 8080:8080 daysoff
```

## Releases

`.github/workflows/release-train.yml` runs on every push to `develop`, `staging`, and `main`. It detects integrated conventional-commit changes, bumps the version, builds and publishes the Docker image (`sisqueslabs/daysoff` on Docker Hub, `ghcr.io/sisques-labs/daysoff` on GHCR), and generates `CHANGELOG.md`/GitHub Releases via [`cliff.toml`](cliff.toml). `develop` and `staging` publish alpha/beta pre-releases; `main` publishes stable releases and syncs back into `develop`.
