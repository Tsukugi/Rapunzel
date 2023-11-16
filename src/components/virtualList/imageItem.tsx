import React from "react";
import CachedImage from "./cachedImage";
import { VirtualItem } from "./interfaces";

interface ImageItemProps {
    item: VirtualItem;
    handleImageLoadStart?: () => void;
    handleImageLoad?: () => void;
    onClick: (item: VirtualItem) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({
    item,
    handleImageLoadStart,
    handleImageLoad,
    onClick,
}): React.JSX.Element => {
    const onClickHandler = () => onClick(item);
    return (
        <CachedImage
            onLoadStart={handleImageLoadStart}
            onLoad={handleImageLoad}
            source={{ uri: item.value }}
            onClick={onClickHandler}
        />
    );
};

export default ImageItem;
