import React from "react";
import CachedImage from "../cachedImage";

interface ImageItemProps {
    item: { id: string; value: string };
    handleImageLoadStart?: () => void;
    handleImageLoad?: () => void;
    onReload: (uri: string) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({
    item: { id, value },
    handleImageLoadStart,
    handleImageLoad,
    onReload,
}): React.JSX.Element => {
    return (
        <CachedImage
            onLoadStart={handleImageLoadStart}
            onLoad={handleImageLoad}
            source={{ uri: value }}
            onReload={onReload}
        />
    );
};

export default (ImageItem);
