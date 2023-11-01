export interface UsesNavigation {
    navigation: { navigate: (actionName: ViewNames) => void };
}

/*
 * ViewNames Provides context to navigation methods about which views we registered.
 */
export type ViewNames = "BrowseView" | "MangaReaderView" | "CacheScreenView";
