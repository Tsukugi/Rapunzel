import React, { ComponentType } from "react";
import { UsesNavigation, ViewNames } from "./interfaces";
import RapunzelBrowse from "../../views/RapunzelBrowse";
import RapunzelReader from "../../views/RapunzelReader";
import RapunzelCache from "../../views/RapunzelCache";
import RapunzelSettings from "../../views/RapunzelSettings";

type ViewList = Record<ViewNames, React.FC<UsesNavigation>>;
const Views: ViewList = {
    RapunzelBrowse,
    RapunzelReader,
    RapunzelCache,
    RapunzelSettings,
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
