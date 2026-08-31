# Changelog

All notable changes to this project will be documented in this file.
## [0.3.6] - 2026-08-31

### Bug Fixes
- **deps:** Update dependency astro to v7.2.9 (#73) (46048f7)

### Chore
- **deps:** Update dependency @types/react-dom to v19.2.5 (#71) (3ed1fa4)
- **deps:** Update dependency eslint to v10.9.1 (#72) (96d84ef)
- **deps:** Update dependency lint-staged to v17.4.1 (#74) (3106e40)
- **deps:** Update dependency typescript-eslint to v8.68.0 (#75) (e8b5675)
- **deps:** Update node.js to v24.20.0 (#76) (e4d4af9)
- **deps:** Update pnpm to v11.24.0 (c7e448a)
- **deps:** Lock file maintenance (8ab3013)
## [0.3.5] - 2026-08-25

### Bug Fixes
- **deps:** Update dependency @astrojs/react to v6.0.4 (#63) (f7c0152)
- **deps:** Update dependency astro to v7.2.4 (#64) (504fd46)

### Chore
- **deps:** Update dependency vitest to v4.1.11 (#62) (31587c0)
- **deps:** Update dependency eslint to v10.9.0 (#65) (81e6d0d)
- **deps:** Update dependency typescript-eslint to v8.67.0 (#66) (03969a3)
- **deps:** Lock file maintenance (#67) (c95b6cc)
## [0.3.4] - 2026-08-19

### Bug Fixes
- **deps:** Pin dependency react-dom to 19.2.8 (fdf1d80)
- **deps:** Pin dependency react to 19.2.8 (c48e31b)
- **deps:** Pin dependency astro to 7.2.0 (d04b070)
- **deps:** Pin dependency @astrojs/react to 6.0.2 (8dd1e4b)

### Chore
- **deps:** Pin dependency @eslint/js to 10.0.1 (8908174)
- **deps:** Pin dependency @tailwindcss/vite to 4.3.3 (12f179c)
- **deps:** Pin dependency eslint-config-prettier to 10.1.8 (1f21048)
- **deps:** Pin dependency eslint to 10.8.1 (3177035)
- **deps:** Pin dependency eslint-plugin-astro to 3.1.0 (baad235)
- **deps:** Pin dependency husky to 9.1.7 (#44) (da0546e)
- **deps:** Pin dependency lint-staged to 17.3.0 (b4e3c2c)
- **deps:** Update pnpm to v11.22.0 (ca2d1d4)
- **deps:** Pin dependency prettier to 3.9.6 (d0d0583)
- **deps:** Pin dependency prettier-plugin-astro to 0.14.1 (bfcd197)
- **deps:** Pin dependency tailwindcss to 4.3.3 (#48) (24cac01)
- **deps:** Pin dependency typescript to 6.0.3 (#49) (50b80f2)
- **deps:** Pin dependency typescript-eslint to v8.66.0 (#50) (7d93751)
- **deps:** Pin dependency vitest to 4.1.10 (#51) (905b22b)
- **deps:** Pin node.js to v24.19.0 (fa89777)
- **deps:** Lock file maintenance (11013a3)
## [0.3.3] - 2026-08-10

### Chore
- **deps:** Update dependency eslint to v10.8.1 (#25) (29cdbfe)
- **deps:** Lock file maintenance (#28) (38d4f54)
- **deps:** Update pnpm to v11.21.0 (510d996)
- **deps:** Pin actions/checkout action to v7.0.1 (f30986e)
- **deps:** Pin actions/configure-pages action to v6.0.0 (93c100b)
- **deps:** Pin actions/deploy-pages action to v5.0.0 (13cdbb8)
- **deps:** Pin actions/upload-pages-artifact action to v5.0.0 (bfc1e31)
- **deps:** Pin dependency @astrojs/check to 0.9.10 (2539be9)
## [0.3.1] - 2026-08-04

### Chore
- **deps:** Update node.js to v24 (aaa3918)
- **deps:** Update actions/upload-pages-artifact action to v5 (5a8ad47)
- **deps:** Update actions/deploy-pages action to v5 (f03f270)
- **deps:** Update actions/configure-pages action to v6 (3003ffb)
## [0.3.0] - 2026-08-04

### Chore
- **deps:** Update nginxinc/nginx-unprivileged docker tag to v1.31 (#8) (9814cae)
- **deps:** Update pnpm to v11.20.0 (#9) (a4afb81)
- **deps:** Lock file maintenance (#15) (dc22961)

### Features
- Highlight calendar when selecting a bridge from the results list (e6a5cf0)
- Redesign header logo and fix header alignment (b85a82e)
## [0.2.0] - 2026-08-04

### Bug Fixes
- Make the calendar navigable with month prev/next controls (2b2fe26)
- Only suggest bridges from today onward (681a6ec)

### Features
- Add light/dark theme toggle and EN/ES language switcher (6656343)

### Redesign
- Give daysoff a distinct visual identity with a 2-column desktop layout (8ee49a6)
## [0.1.0] - 2026-08-04

### Bug Fixes
- Address PR review comments (136f5d8)
- Diff test:changed against the previous commit (2dea33e)
- Show the calendar before the results list (85bb70d)

### Chore
- Add README.md (1d4355c)
- Bootstrap Astro project with husky and CI tooling (e954fcc)

### Features
- Dockerize app and add release-train, CodeQL, and PR labeler workflows (a3a02db)
- Implement the vacation bridge calculator MVP (dc5b519)
- Deploy to GitHub Pages on push to main (3c1f0e4)

### Refactor
- Consolidate holiday data into a single JSON per year (dedc300)

