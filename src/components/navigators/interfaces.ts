export interface UsesNavigation {
    navigation: { navigate: (actionName: ViewNames) => void };
}

/*
 * ViewNames Provides context to navigation methods about which views we registered.
 */
export enum ViewNames {
    RapunzelWebView = "RapunzelWebView",
    RapunzelBrowse = "RapunzelBrowse",
    RapunzelReader = "RapunzelReader",
    RapunzelSettings = "RapunzelSettings",
    RapunzelChapterSelect = "RapunzelChapterSelect",
}

export type ViewNameKeys = keyof typeof ViewNames;
