export interface UsesNavigation {
    navigation: { navigate: (actionName: ViewNames) => void };
}

/*
 * ViewNames Provides context to navigation methods about which views we registered.
 */
export enum ViewNames {
    RapunzelBrowse = "RapunzelBrowse",
    RapunzelReader = "RapunzelReader",
    RapunzelSettings = "RapunzelSettings",
}

export type ViewNameKeys = keyof typeof ViewNames;
