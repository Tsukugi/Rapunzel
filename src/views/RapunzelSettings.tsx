import React, { FC } from "react";
import { List } from "react-native-paper";
import { LilithLanguage } from "@atsu/lilith";

import ScrollContent from "../components/scrollContent";
import RapunzelConfigCheckbox from "../components/paper/RapunzelConfigCheckbox";
import CacheScreen from "../components/cache/cacheScreen";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import { useRapunzelStore } from "../store/store";
import { useRapunzelStorage } from "../cache/storage";
import { StorageEntries } from "../cache/interfaces";
import { RapunzelSelect } from "../components/RapunzelSelect";
import { LilithRepo } from "../store/interfaces";

interface RapunzelSettingsProps extends UsesNavigation {}

const RapunzelSettings: FC<RapunzelSettingsProps> = ({ navigation }) => {
    const [openedAccordion, setOpenedAccordion] = React.useState<
        string | number
    >(1);

    const {
        config: [config],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelSettings, navigation });

    const onSetValueHandlerRepository = (value: string[]) => {
        config.repository = value[0] as LilithRepo;
        useRapunzelStorage().setItem(StorageEntries.config, config);
    };
    const onSetValueHandlerLanguages = (value: string[]) => {
        config.languages = value as LilithLanguage[];
        useRapunzelStorage().setItem(StorageEntries.config, config);
    };

    return (
        <ScrollContent>
            <List.AccordionGroup
                expandedId={openedAccordion}
                onAccordionPress={setOpenedAccordion}
            >
                <List.Accordion title="App settings" id={1}>
                    <RapunzelConfigCheckbox
                        label="Enable debug app"
                        configId="debug"
                    />
                    <RapunzelConfigCheckbox
                        label="Use Fallback extensions"
                        configId="useFallbackExtensionOnDownload"
                    />
                    <RapunzelSelect
                        label="Repository"
                        initialValue={[config.repository]}
                        list={Object.values(LilithRepo)}
                        onSelect={onSetValueHandlerRepository}
                    />
                    {/* 
                    // TODO enable this when we support multi selector and filter languages
                    <RapunzelSelect
                        label="Languages"
                        initialValue={config.languages}
                        list={Object.values(LilithLanguage)}
                        onSelect={onSetValueHandlerLanguages}
                    /> */}
                </List.Accordion>
                <List.Accordion title="Library and Temporary Cache" id={2}>
                    <CacheScreen />
                </List.Accordion>
            </List.AccordionGroup>
        </ScrollContent>
    );
};

export default RapunzelSettings;
