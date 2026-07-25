# Project test matrix

Date: 2026-07-25

This is the current test and build view for every active local project used by Rapunzel.

| Project | Role | Test command | Current test result | Build result |
| --- | --- | --- | --- | --- |
| Rapunzel | React Native app | `npx jest --config jest.config.ts --runInBand --testPathIgnorePatterns scripts` | PASS: 15 suites, 57 tests | `assembleEmulator` PASS |
| AmagiChan | Amagi scraper package | `npm test -- --runInBand` | PASS: 1 suite, 2 tests for `useAmagi` | `npm run build` PASS |
| Lilith | Shared API loader and types | `npm test -- --runInBand` | PASS: 1 suite, 2 core tests | `npm run build` PASS |
| LilithMangaDex | MangaDex adapter | `npm test -- --runInBand` | PASS: 2 suites, 3 tests | `npm run build` PASS |
| LilithNHentai | NHentai v2 adapter | `npm test -- --runInBand` | PASS: 9 suites, 27 tests | `npm run build` PASS |

Rapunzel's full `npm test` also runs release-script tests. Those have known Windows-path failures, so the app-suite command above is the feature gate for app work.

## Build order

1. Build Lilith core.
2. Build AmagiChan and the active source adapters.
3. In Rapunzel, install with `npm ci --ignore-scripts`.
4. Build and install the Android emulator app.

Use the deployed smoke test in `docs/SmokeTestGuide.md` after the package checks. It covers feed loading, scroll pagination, stable scroll height, NHentai image URLs, reader loading, and error states.

## AI and agent rules

- Read the implementation and current tests before editing.
- For a bug, add a focused failing test first and reproduce the failure.
- For an improvement, inspect the implementation first; add or update tests when behavior changes.
- Find the cause and fix that cause. Do not use blind, recovery, or best-effort fixes.
- Keep wording simple. Keep changes small and preserve existing user edits.
- Keep deterministic unit tests separate from deployed emulator and live-network checks.
- Do not commit secrets, generated `dist` output, emulator state, or local machine files.
- The adapter `lint` scripts include `--fix`; review the diff immediately if using them.
- Keep each repository's commit focused. Explain both what changed and why.

## Project ownership

- Rapunzel owns the app UI, feed pagination, persistence, device image cache, reader UI, and deployed behavior.
- AmagiChan owns the Amagi scraper package. Its tests cover the current Puppeteer page-loader API; browser/network smoke testing remains separate.
- Lilith owns shared request, DOM, repository, and type contracts. Adapter type failures can come from this shared contract.
- LilithMangaDex owns the MangaDex adapter.
- LilithNHentai owns NHentai v2 URL mapping and image behavior. Keep compound suffixes such as `.jpg.webp` intact, and test HTTP error handling explicitly.
