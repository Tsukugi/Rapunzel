# Rapunzel agent guidance

## Project

Rapunzel is a React Native 0.72 app for reading and downloading books and manga from Lilith repositories. It uses React Navigation, React Native Paper, Taihou for state and effects, MMKV for persistence, and a custom image cache.

## Repository map

- `src/` contains the app, API loader, cache, store, lifecycle, views, and shared tools.
- `__tests__/` contains Jest tests for app behavior and utilities.
- `scripts/` contains release tooling and its tests.
- `android/` and `ios/` contain native project files.
- `docs/` contains behavior notes, troubleshooting details, the deployed smoke-test guide, and the cross-project test matrix.

## Commands

- Install dependencies: `npm i`
- Start Metro: `npm run start`
- Run the app: `npm run android` or `npm run ios`
- Run tests: `npm test`
- Run lint: `npm run lint`
- Run the TypeScript checker: `npx tsc --noEmit`

## Working rules

- Read the relevant implementation and tests before editing.
- For a bug, reproduce it with a focused test before changing code.
- For an improvement, inspect the current implementation first, then add or update tests when behavior changes.
- Do not make blind fixes or recovery/best-effort fixes. Identify the cause and fix that cause.
- Keep changes small and consistent with the existing React Native architecture.
- Do not add secrets, credentials, generated build output, or local machine state.
- Preserve user changes already present in the worktree.

## Verification

Before handing off a code change, run the most relevant focused tests, then `npm test`, `npm run lint`, and `npx tsc --noEmit` when the local toolchain supports them. Review the final diff and report any check that could not run.

## Commits

If a commit is requested, use a clear title and a summary of at least 50 words that explains what changed and why. Do not put file paths in the commit message.
