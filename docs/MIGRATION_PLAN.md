# RapunzelV1 to RapunzelV2 Migration Plan

## Overview
This document outlines the plan for migrating the source code from the original RapunzelV1 React Native app to the new RapunzelV2 app. The migration involves keeping the custom state management system (`@atsu/taihou`), modernizing navigation, and restructuring components while preserving core functionality.

## Architecture Comparison

### RapunzelV1
- State Management: Custom `@atsu/taihou` library
- Navigation: Custom navigation configuration with DrawerNavigator
- Structure: Components, navigators, views, API layer, cache, store, tools, lifecycle

### RapunzelV2
- State Management: Custom `@atsu/taihou` library (preserved)
- Navigation: React Navigation v6 (Stack, Bottom Tab, Drawer)
- Structure: Components, screens, navigation, store, theme

## Migration Steps

### Phase 1: Setup and Types
1. Create necessary type definitions to match RapunzelV1 interfaces
2. Set up Taihou stores to match existing state structure
3. Define navigation types and route names

### Phase 2: State Migration
1. Migrate existing Taihou state definitions to the new project structure:
   - ConfigState with its corresponding Taihou store
   - ReaderState with its corresponding Taihou store
   - LibraryState with its corresponding Taihou store
   - BrowseState with its corresponding Taihou store
   - LatestBooksState with its corresponding Taihou store
   - PopularBooksState with its corresponding Taihou store
   - LoadingState with its corresponding Taihou store
   - UIState with its corresponding Taihou store
   - AutoFetchWebviewState with its corresponding Taihou store
2. Update store configuration to maintain Taihou patterns
3. Migrate state initialization logic

### Phase 3: Navigation Migration
1. Map RapunzelV1 ViewNames to RapunzelV2 navigation structure
2. Update navigation calls to use React Navigation v6 patterns
3. Create new screen components that match RapunzelV1 views
4. Implement drawer navigator reflecting V1 view config and sync Taihou router state (done)

### Phase 4: Component Migration
1. Convert RapunzelV1 views to RapunzelV2 screen components
2. Update all components to maintain Taihou hook usage
3. Adapt UI components to work with Taihou state
4. Initial port: MainFeed, Browse, and Reader now use the Lilith loader (network-only, cache pending)

### Phase 5: Business Logic Preservation
1. Migrate API layer functions (useLilithAPI)
2. Preserve caching mechanisms and storage utilities
3. Keep utility functions (date, library, string, list, etc.)
4. Maintain app lifecycle logic (onAppStart)

### Phase 6: Integration and Testing
1. Ensure all state transitions work properly
2. Verify navigation between screens
3. Test API integration and caching
4. Validate library and reading functionality
5. Update App.tsx to use Taihou Provider and new navigation

## Detailed Component Mapping

### Store State Mapping
| RapunzelV1 State | RapunzelV2 Taihou Store |
|------------------|-------------------------|
| ConfigState | ConfigStore |
| ReaderState | ReaderStore |
| LibraryState | LibraryStore |
| BrowseState | BrowseStore |
| LatestBooksState | LatestBooksStore |
| PopularBooksState | PopularBooksStore |
| LoadingState | LoadingStore |
| UIState | UIStore |
| AutoFetchWebviewState | AutoFetchWebviewStore |

### View Mapping
| RapunzelV1 View | RapunzelV2 Screen |
|-----------------|-------------------|
| RapunzelBrowse | BrowseScreen |
| RapunzelReader | ReaderScreen |
| RapunzelLibrary | LibraryScreen |
| RapunzelSettings | SettingsScreen |
| RapunzelMainFeed | MainFeedScreen |
| RapunzelWebView | WebViewScreen |
| RapunzelChapterSelect | ChapterSelectScreen |

### Critical Data Types to Define
- RapunzelImage interface
- LibraryBook interface
- VirtualItem<T> type
- ConfigState, ReaderState, etc.
- ViewNames enum
- LilithRepo enum

## Technical Considerations

1. **State Migration**: Migrating Taihou state patterns to the new project structure while preserving functionality
2. **Navigation**: Adapting custom navigation to React Navigation v6
3. **API Integration**: Preserving existing API calls while adapting to new project structure
4. **Caching**: Maintaining image and data caching functionality
5. **Performance**: Ensuring virtual lists and other performance optimizations remain effective
6. **Compatibility**: Maintaining compatibility with existing libraries and dependencies

## Timeline Estimation
- Phase 1: 1 day
- Phase 2: 2-3 days
- Phase 3: 1-2 days
- Phase 4: 2-3 days
- Phase 5: 1-2 days
- Phase 6: 1-2 days
- Total: 8-13 days

## Success Criteria
- All original functionality preserved
- App compiles and runs without errors
- State management works correctly with Taihou
- Navigation works with React Navigation v6
- All views are accessible and functional
- API integration continues to work
- Caching system functions properly
- App passes existing tests (where applicable)

## Current Progress (V2)
- Taihou store initialized with config/library hydration; AsyncStorage dependency installed (Expo dev client required) with in-memory fallback.
- Library: save/remove/toggle implemented; long-press on Feed/Browse saves; badges show saved state; Library screen renders saved books and opens first chapter.
- Reader/Chapters: Reader links to new Chapter Select screen with pagination and locale badges.
- Navigation: Drawer mapping mirrors V1 view names; initial routing respects `config.initialView` and NHentai WebView override.
- Pending: persist config mutations from Settings, port WebView clearance (cookies/user-agent), implement feed cache hydration/persistence, and add tests for storage + library flows.
