import React from "react";
import { UsesNavigation, ViewNames } from "./interfaces";
import RapunzelBrowse from "../../views/RapunzelBrowse";
import RapunzelReader from "../../views/RapunzelReader";
import RapunzelSettings from "../../views/RapunzelSettings";

//* Dependencies thay may be abstacted to other place
import { DrawerNavigationOptions } from "@react-navigation/drawer";
import { HeaderLeftMode } from "../paper/interfaces";

export type ViewDict = Record<ViewNames, ViewNavigationData>;

export interface ViewNavigationData {
    component: React.FC<UsesNavigation>;
    icon: string;
    header: {
        leftMode?: HeaderLeftMode;
    };
    viewDrawerOptions: Partial<DrawerNavigationOptions>;
}

const getViews = (): ViewDict => {
    const Views: ViewDict = {
        RapunzelBrowse: {
            component: RapunzelBrowse,
            icon: "card-search-outline",
            header: {},
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
                headerStyle: {
                    backgroundColor: "transparent",
                },
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
    };
    return Views;
};

export const Navigation = {
    getViews,
};
