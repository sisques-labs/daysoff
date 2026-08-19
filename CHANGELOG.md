# Changelog

All notable changes to this project will be documented in this file.
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

