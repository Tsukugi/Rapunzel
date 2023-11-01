import React, { ComponentType } from "react";
import BrowseView from "../../views/browse";
import CacheScreenView from "../../views/cacheScreenView";
import MangaReaderView from "../../views/mangaReader";
import { UsesNavigation, ViewNames } from "./interfaces";

type ViewList = Record<ViewNames, React.FC<UsesNavigation>>;
const Views: ViewList = {
    BrowseView,
    MangaReaderView,
    CacheScreenView,
};

const getViews = () =>
    Object.values(Views).map((view) => ({
        name: view.name,
        component: view as ComponentType<{}>,
        icon: "home",
    }));

export const Navigation = {
    getViews,
};
