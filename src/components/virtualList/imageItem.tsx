import React from "react";
import CachedImage from "./cachedImage";
import { VirtualItem } from "./interfaces";
import { RapunzelImage } from "../../store/interfaces";

interface ImageItemProps {
    item: VirtualItem<RapunzelImage>;
    handleImageLoadStart?: () => void;
    handleImageLoad?: () => void;
    onClick?: (item: VirtualItem<RapunzelImage>) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({
    item,
    handleImageLoadStart,
    handleImageLoad,
    onClick = (item) => {},
}): React.JSX.Element => {
    const onClickHandler = () => onClick(item);
    return (
        <CachedImage
            onLoadStart={handleImageLoadStart}
            onLoad={handleImageLoad}
            onClick={onClickHandler}
            image={item.value}
        />
    );
};

export default ImageItem;
