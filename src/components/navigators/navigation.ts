import React from "react";
import { UsesNavigation, ViewNames } from "./interfaces";
import RapunzelBrowse from "../../views/RapunzelBrowse";
import RapunzelReader from "../../views/RapunzelReader";
import RapunzelSettings from "../../views/RapunzelSettings";
import RapunzelWebView from "../../views/RapunzelWebView";

//* Dependencies thay may be abstacted to other place
import { DrawerNavigationOptions } from "@react-navigation/drawer";
import { HeaderLeftMode } from "../paper/interfaces";

export type ViewDict = Record<ViewNames, ViewNavigationData>;

export interface ViewNavigationData {
    component: React.FC<UsesNavigation>;
    icon: string;
    header: {
        leftMode?: HeaderLeftMode;
        showSearch?: boolean;
    };
    viewDrawerOptions: Partial<DrawerNavigationOptions>;
}

const getViews = (): ViewDict => {
    const Views: ViewDict = {
        RapunzelBrowse: {
            component: RapunzelBrowse,
            icon: "card-search-outline",
            header: { showSearch: true },
            viewDrawerOptions: {
                title: "Browse",
            },
        },
        RapunzelReader: {
            component: RapunzelReader,
            icon: "book",
            header: {
                leftMode: HeaderLeftMode.back,
            },
            viewDrawerOptions: {
                title: "Reader",
            },
        },
        RapunzelSettings: {
            component: RapunzelSettings,
            icon: "application-settings",
            header: {},
            viewDrawerOptions: {
                title: "Settings",
            },
        },
        RapunzelWebView: {
            component: RapunzelWebView,
            icon: "wifi",
            header: {},
            viewDrawerOptions: {
                title: "WebView",
            },
        },
    };
    return Views;
};

export const Navigation = {
    getViews,
};
