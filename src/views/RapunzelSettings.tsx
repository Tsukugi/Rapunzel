import React, { FC } from "react";
import { List } from "react-native-paper";
import ScrollContent from "../components/scrollContent";
import RapunzelConfigCheckbox from "../components/paper/RapunzelConfigCheckbox";
import CacheScreen from "../components/cacheScreen";
import { ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";

interface RapunzelSettingsProps {
    // Define your component props here
}

const RapunzelSettings: FC<RapunzelSettingsProps> = ({}) => {
    useRouter({ route: ViewNames.RapunzelSettings });
    return (
        <ScrollContent>
            <List.AccordionGroup>
                <List.Accordion title="App settings" id="1">
                    <RapunzelConfigCheckbox
                        label="Enable debug app"
                        configId="debug"
                    />
                    <RapunzelConfigCheckbox
                        label="Use Fallback extensions"
                        configId="useFallbackExtensionOnDownload"
                    />
                </List.Accordion>
                <List.Accordion title="Device and Cache" id="2">
                    <CacheScreen />
                </List.Accordion>
            </List.AccordionGroup>
        </ScrollContent>
    );
};

export default RapunzelSettings;
