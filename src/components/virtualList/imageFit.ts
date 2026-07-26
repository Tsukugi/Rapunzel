import { ReaderImageFit } from "../../store/interfaces";

export interface ImageDimensions {
    width?: number;
    height?: number;
}

export interface ViewportDimensions {
    width: number;
    height: number;
}

export interface FittedImageDimensions {
    width: number;
    height: number;
}

/**
 * Calculates the displayed size without changing the source image ratio.
 * Auto uses the image's longest dimension as the fitted screen dimension.
 */
export const getFittedImageDimensions = (
    image: ImageDimensions,
    viewport: ViewportDimensions,
    fit: ReaderImageFit = ReaderImageFit.Width,
): FittedImageDimensions => {
    const imageWidth = image.width || viewport.width;
    const imageHeight = image.height || viewport.width * 1.4;

    const dimensionToFit =
        fit === ReaderImageFit.Auto
            ? imageWidth >= imageHeight
                ? ReaderImageFit.Width
                : ReaderImageFit.Height
            : fit;

    const scale =
        dimensionToFit === ReaderImageFit.Height
            ? viewport.height / imageHeight
            : viewport.width / imageWidth;

    return {
        width: imageWidth * scale,
        height: imageHeight * scale,
    };
};
