import React, { FC } from "react";
import CacheScreen from "../components/cacheScreen";
import ScrollContent from "../components/scrollContent";
import Section from "../components/section";
import CachedImagesList from "../components/cachedImageList";
import Content from "../components/content";

interface CacheScreenViewProps {
    // Define your component props here
}

const CacheScreenView: FC<CacheScreenViewProps> = ({}) => {
    return (
        <Content>
            <Section title="Cache">
                <CacheScreen />
            </Section>
            <Section title="List">
                <CachedImagesList></CachedImagesList>
            </Section>
        </Content>
    );
};

export default CacheScreenView;
