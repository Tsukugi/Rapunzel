import React, { FC } from "react";
import CacheScreen from "../components/cacheScreen";
import Section from "../components/section";
import CachedImagesList from "../components/cachedImageList";
import ScrollContent from "../components/scrollContent";

interface RapunzelCacheProps {
    // Define your component props here
}

const RapunzelCache: FC<RapunzelCacheProps> = ({}) => {
    return (
        <ScrollContent>
            <Section title="Cache">
                <CacheScreen />
            </Section>
            <Section title="List">
                <CachedImagesList></CachedImagesList>
            </Section>
        </ScrollContent>
    );
};

export default RapunzelCache;
