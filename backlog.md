# Rapunzel backlog

This file lists work that is still open. Keep it short, current, and specific.

## Open items

### BL-019: Fix Pixel reader book-loading stall

- Status: open
- Added: 2026-08-13
- Source: Pixel 7 release smoke test
- Problem or goal: Release 0.9.10 opens a search result and enters Reader, but the Reader stays blank. Debug logs show the book request starts and the follow-up chapter request to the same NHentai gallery endpoint does not complete, so no reader images are cached.
- Acceptance criteria: On the Pixel 7, search for `Dendou Monaka`, open `Futanari Taiken Esthe Salon`, and see the first reader page load with no request hang or blank Reader screen.

### BL-015: Harden release navigation screen names

- Status: open
- Added: 2026-08-06
- Source: Pixel 7 ADB crash reproduction
- Problem or goal: The 0.9.4 release can crash during startup when minified React component names become empty and all drawer screens receive the same empty React Navigation name.
- Acceptance criteria: Use stable view keys for drawer screen names, publish the fix in a new version, and verify the updated APK starts on the Pixel 7 without the duplicate-screen crash.

## Item format

Add each item as a heading with a stable ID. Include enough detail for another agent to understand the problem or requested improvement without guessing.

```md
### BL-000: Short title

- Status: open
- Added: YYYY-MM-DD
- Source: issue, investigation, user request, or test
- Problem or goal: What needs to change and why.
- Acceptance criteria: How to tell that the item is complete.
```

When an item is completed, remove it from this file and add it to [backlog-resolved.md](backlog-resolved.md) with its resolution and completion date.
