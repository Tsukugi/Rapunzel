# Rapunzel backlog

This file lists work that is still open. Keep it short, current, and specific.

## Open items

### BL-011: Make Android OTA bundles match the Hermes release format

- Status: open
- Added: 2026-08-04
- Source: user report and focused OTA artifact check
- Problem or goal: The Android OTA archive was carrying plain Metro source
  while the release APK carries Hermes bytecode. A downloaded update could
  fail during the first startup and roll back to the embedded bundle.
- Acceptance criteria: Android OTA generation compiles the bundle with the
  repository's Hermes compiler, the uploaded archive contains the bytecode
  format, and a supported installed APK applies the update and starts again
  without rollback.

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
