import React from "react";
import { UsesNavigation, ViewNames } from "./interfaces";
import RapunzelBrowse from "../../views/RapunzelBrowse";
import RapunzelReader from "../../views/RapunzelReader";
import RapunzelSettings from "../../views/RapunzelSettings";
import RapunzelWebView from "../../views/RapunzelWebView";
import RapunzelChapterSelect from "../../views/RapunzelChapterSelect";

//* Dependencies thay may be abstacted to other place
import { DrawerNavigationOptions } from "@react-navigation/drawer";
import { HeaderLeftMode } from "../paper/interfaces";
import RapunzelMainFeed from "../../views/RapunzelMainFeed";
import RapunzelLibrary from "../../views/RapunzelLibrary";

export type ViewDict = Record<ViewNames, ViewNavigationData>;

export enum SearchBehaviour {
    SendSearchRequest = "SendSearchRequest",
    FilterLibrary = "FilterLibrary",
}

interface HeaderOptions {
    hideReader: boolean;
    absoluteMode: boolean;
    leftMode: HeaderLeftMode;
    showSearch: boolean;
    searchBehaivour: SearchBehaviour;
}

export interface ViewNavigationData {
    component: React.FC<UsesNavigation>;
    icon: string;
    headerOptions: Partial<HeaderOptions>;
    /*
     * If viewDrawerOptions is undefined the screen will not be rendered on the drawer as a drawerItem,
     * but we can still navigate to it.
     */
    viewDrawerOptions?: Partial<DrawerNavigationOptions> | undefined;
}

const getViews = (): Partial<ViewDict> => {
    const Views: Partial<ViewDict> = {
        RapunzelMainFeed: {
            component: RapunzelMainFeed,
            icon: "home",
            headerOptions: { showSearch: true },
            viewDrawerOptions: {
                title: "Feed",
            },
        },
        RapunzelBrowse: {
            component: RapunzelBrowse,
            icon: "card-search-outline",
            headerOptions: { showSearch: true },
            viewDrawerOptions: {
                title: "Browse",
            },
        },
        RapunzelLibrary: {
            component: RapunzelLibrary,
            icon: "tab-search",
            headerOptions: {
                showSearch: true,
                searchBehaivour: SearchBehaviour.FilterLibrary,
            },
            viewDrawerOptions: {
                title: "Library",
            },
        },
        RapunzelSettings: {
            component: RapunzelSettings,
            icon: "application-settings",
            headerOptions: {},
            viewDrawerOptions: {
                title: "Settings",
            },
        },
        RapunzelReader: {
            component: RapunzelReader,
            icon: "book",
            headerOptions: {
                hideReader: true,
            },
            viewDrawerOptions: {
                title: "Reader",
            },
        },
        RapunzelWebView: {
            component: RapunzelWebView,
            icon: "wifi",
            headerOptions: {},
            viewDrawerOptions: {
                title: "WebView",
            },
        },
        RapunzelChapterSelect: {
            component: RapunzelChapterSelect,
            icon: "tray",
            headerOptions: {
                leftMode: HeaderLeftMode.back,
            },
        },
    };
    return Views;
};

export const Navigation = {
    getViews,
};
