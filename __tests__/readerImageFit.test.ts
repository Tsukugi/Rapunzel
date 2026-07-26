import { describe, expect, test } from "@jest/globals";

import { ReaderImageFit } from "../src/store/interfaces";
import { getFittedImageDimensions } from "../src/components/virtualList/imageFit";

describe("reader image fit", () => {
    const viewport = { width: 360, height: 800 };

    test("fits the image width by default", () => {
        expect(
            getFittedImageDimensions({ width: 1200, height: 1800 }, viewport),
        ).toEqual({ width: 360, height: 540 });
    });

    test("fits the image height when requested", () => {
        expect(
            getFittedImageDimensions(
                { width: 1200, height: 1800 },
                viewport,
                ReaderImageFit.Height,
            ),
        ).toEqual({ width: 533.3333333333333, height: 800 });
    });

    test("auto fits a wide image to width and a tall image to height", () => {
        expect(
            getFittedImageDimensions(
                { width: 1800, height: 1200 },
                viewport,
                ReaderImageFit.Auto,
            ),
        ).toEqual({ width: 360, height: 240 });
        expect(
            getFittedImageDimensions(
                { width: 1200, height: 1800 },
                viewport,
                ReaderImageFit.Auto,
            ),
        ).toEqual({ width: 533.3333333333333, height: 800 });
    });
});
