import React, { FC } from "react";
import ScrollContent from "../components/scrollContent";
import RapunzelConfigCheckbox from "../components/paper/RapunzelConfigCheckbox";

interface RapunzelSettingsProps {
    // Define your component props here
}

const RapunzelSettings: FC<RapunzelSettingsProps> = ({}) => {
    return (
        <ScrollContent>
            <RapunzelConfigCheckbox label="Enable debug app" configId="debug" />
            <RapunzelConfigCheckbox
                label="Use Fallback extensions"
                configId="useFallbackExtensionOnDownload"
            />
        </ScrollContent>
    );
};

export default RapunzelSettings;
