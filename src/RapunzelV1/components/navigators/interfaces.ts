import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ParamListBase } from "@react-navigation/native";

export interface UsesNavigation {
    navigation: DrawerNavigationProp<ParamListBase, string, undefined>;
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
    RapunzelMainFeed = "RapunzelMainFeed",
    RapunzelLibrary = "RapunzelLibrary",
}

export type ViewNameKeys = keyof typeof ViewNames;
