import React, { FC } from "react";
import { List } from "react-native-paper";
import { LilithRepo } from "@atsu/lilith";

import ScrollContent from "../components/scrollContent";
import RapunzelConfigCheckbox from "../components/paper/RapunzelConfigCheckbox";
import CacheScreen from "../components/cacheScreen";
import { ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import { useRapunzelStore } from "../store/store";
import { useRapunzelStorage } from "../cache/storage";
import { StorageEntries } from "../cache/interfaces";
import { RapunzelSelect } from "../components/RapunzelSelect";

interface RapunzelSettingsProps {}

const RapunzelSettings: FC<RapunzelSettingsProps> = ({}) => {
    const {
        config: [config],
    } = useRapunzelStore();
    useRouter({ route: ViewNames.RapunzelSettings });

    const onSetValueHandler = (value: string) => {
        config.repository = value as LilithRepo;
        useRapunzelStorage().setItem(StorageEntries.config, config);
    };

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
                    <RapunzelSelect
                        label="Repository"
                        initialValue={config.repository}
                        list={[LilithRepo.NHentai, LilithRepo.MangaDex]}
                        onSelect={onSetValueHandler}
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
