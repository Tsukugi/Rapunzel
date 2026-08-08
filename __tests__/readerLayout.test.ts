import { describe, expect, test } from "@jest/globals";

import { getReaderPageLayout } from "../src/components/virtualList/readerLayout";
import { ReaderImageFit } from "../src/store/interfaces";

describe("reader page layout", () => {
    test("uses each page's fitted height in the following page offset", () => {
        const data = [
            {
                id: "page-1",
                value: { uri: "page-1", width: 1200, height: 2400 },
            },
            {
                id: "page-2",
                value: { uri: "page-2", width: 1000, height: 1500 },
            },
        ];

        expect(
            getReaderPageLayout(data, 0, ReaderImageFit.Width, {
                width: 360,
                height: 800,
            }),
        ).toEqual({ length: 720, offset: 0, index: 0 });
        expect(
            getReaderPageLayout(data, 1, ReaderImageFit.Width, {
                width: 360,
                height: 800,
            }),
        ).toEqual({ length: 540, offset: 720, index: 1 });
    });

    test("keeps a predictable fallback length when page dimensions are missing", () => {
        const layout = getReaderPageLayout(
            [{ id: "page-1", value: { uri: "page-1" } }],
            0,
            ReaderImageFit.Width,
            { width: 360, height: 800 },
        );

        expect(layout.index).toBe(0);
        expect(layout.offset).toBe(0);
        expect(layout.length).toBeCloseTo(504);
    });
});
