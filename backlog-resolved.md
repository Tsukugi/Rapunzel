# Rapunzel resolved backlog

This file records backlog items that were completed. Keep the history concise and do not delete resolved items unless they were recorded by mistake.

## Resolved items

### BL-003: Prevent default header search overflow

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user report and focused layout test
- Problem or goal: The expanded search field reserved a fixed minimum width and then became too small after that width was removed because an empty header content item consumed the remaining space.
- Resolution: Replaced the fixed search width with a shrinkable flex container and removed the empty header content spacer while search is shown, so the search field owns the available middle area.
- Verification: The focused search and header layout tests passed, the full Jest suite passed (23 suites, 102 tests), and the phone UI hierarchy showed the search field expanded from 90px to 472px while staying inside the header bounds.

### BL-002: Reader controls and display settings

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user request
- Problem or goal: Reader pages had no reader-specific controls, alternate page navigation, or image fit choices.
- Resolution: Added a fixed reader header that appears on upward scroll and hides on downward scroll or after three seconds. The header shows the book title, save/unsave, and reader settings. Reader settings now persist scroll or single-page navigation plus width, height, or automatic image fitting. Single-page mode uses invisible left and right tap areas for page navigation. A phone smoke check found that positioning Paper's Appbar.Header directly made its wrapper zero-sized, so the header now uses a measurable absolute overlay wrapper.
- Verification: Focused reader, reader-header-layout, image-fit, storage, pinchable-image, and virtual-list tests passed; full Jest suite passed (24 suites, 103 tests). The physical phone loaded the reader and 54 pages without React Native or Android errors; Xiaomi ADB input blocked the final manual scroll gesture.

### BL-001: Confirm and show progress for settings actions

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user request and UX review
- Problem or goal: Important settings actions did not consistently ask for confirmation or show progress while they ran.
- Resolution: Added confirmation dialogs for import, library migration, and both cache-clearing actions. Added loading and disabled states, result messages, cache-size failure feedback, disabled cache selectors during actions, and theme-aware Danger Zone styling. Cache cleanup now reports failures instead of silently treating them as success.
- Verification: Focused `cacheScreen` tests passed; full Jest suite passed with 19 suites and 92 tests. Source checks for the changed settings components passed. Repository-wide lint and TypeScript checks still contain pre-existing errors.

## Item format

Move completed items here from [backlog.md](backlog.md) and preserve their original ID. Add the completion date and a short description of the cause and resolution.

```md
### BL-000: Short title

- Status: resolved
- Added: YYYY-MM-DD
- Resolved: YYYY-MM-DD
- Source: issue, investigation, user request, or test
- Problem or goal: What needed to change and why.
- Resolution: What changed and why it fixes the item.
- Verification: Tests, checks, or manual validation used.
```
