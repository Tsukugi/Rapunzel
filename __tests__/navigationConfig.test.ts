import { describe, expect, test } from "@jest/globals";
import React from "react";

import type { ViewDict } from "../src/components/navigators/navigationConfig";
import { UsesNavigation } from "../src/components/navigators/interfaces";
import { getViewEntries } from "../src/components/navigators/viewEntries";

describe("navigation view entries", () => {
    test("uses stable view keys when component names are empty", () => {
        const component = (() => null) as React.FC<UsesNavigation>;
        Object.defineProperty(component, "name", { value: "" });

        const views: Partial<ViewDict> = {
            RapunzelBrowse: {
                component,
                icon: "card-search-outline",
                headerOptions: {},
            },
        };

        expect(getViewEntries(views).map(([name]) => name)).toEqual([
            "RapunzelBrowse",
        ]);
    });
});
