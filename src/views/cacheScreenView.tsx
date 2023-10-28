import React, { FC } from "react";
import CacheScreen from "../components/cacheScreen";
import ScrollContent from "../components/scrollContent";
import Section from "../components/section";

interface CacheScreenViewProps {
    // Define your component props here
}

const CacheScreenView: FC<CacheScreenViewProps> = ({}) => {
    return (
        <ScrollContent>
            <Section title="Cache">
                <CacheScreen />
            </Section>
        </ScrollContent>
    );
};

export default CacheScreenView;
