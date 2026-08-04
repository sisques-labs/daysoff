# Changelog

All notable changes to this project will be documented in this file.
## [0.3.0] - 2026-08-04

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

