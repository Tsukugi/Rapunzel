import type { ViewDict, ViewNavigationData } from "./navigationConfig";

export const getViewEntries = (
    views: Partial<ViewDict>,
): Array<[string, ViewNavigationData]> =>
    Object.entries(views).filter(
        (entry): entry is [string, ViewNavigationData] =>
            entry[1] !== undefined,
    );
