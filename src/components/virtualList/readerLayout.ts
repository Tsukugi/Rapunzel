import { Dimensions } from "react-native";

import { VirtualItem } from "./interfaces";
import { getFittedImageDimensions, ViewportDimensions } from "./imageFit";
import { RapunzelImage, ReaderImageFit } from "../../store/interfaces";

export const getReaderPageLayout = (
    data: ArrayLike<VirtualItem<RapunzelImage>> | null | undefined,
    index: number,
    imageFit: ReaderImageFit,
    viewport: ViewportDimensions = Dimensions.get("screen"),
) => {
    const getPageLength = (pageIndex: number) => {
        const item = data?.[pageIndex];
        if (!item) return 0;

        return getFittedImageDimensions(
            item.value,
            viewport,
            imageFit,
        ).height;
    };

    let offset = 0;
    for (let pageIndex = 0; pageIndex < index; pageIndex += 1) {
        offset += getPageLength(pageIndex);
    }

    return {
        length: getPageLength(index),
        offset,
        index,
    };
};
