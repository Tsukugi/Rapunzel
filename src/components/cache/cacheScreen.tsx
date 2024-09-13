import React, { useState } from "react";
import { DeviceCache } from "../../cache/cache";
import { Button, Card, List } from "react-native-paper";
import { Export } from "../../cache/Export";
import { useRapunzelStore } from "../../store/store";
import { useRapunzelStorage } from "../../cache/storage";
import { ImageCacheLocations, StorageEntries } from "../../cache/interfaces";
import { RapunzelSelect } from "../RapunzelSelect";
import { RapunzelCache } from "../../cache/useRapunzelCache";

const CacheScreen = () => {
    const {
        library: [library],
        config: [config],
    } = useRapunzelStore();
    const { setItem } = useRapunzelStorage();

    const [tempSize, setTempSize] = useState(0);
    const [librarySize, setLibrarySize] = useState(0);

    const onCalculateSizeHandler = () => {
        DeviceCache.calculateCacheSize(config.cacheTempImageLocation).then(
            (value) => setTempSize(value),
        );
        DeviceCache.calculateCacheSize(config.cachelibraryLocation).then(
            (value) => setLibrarySize(value),
        );
    };
    const onExportHandler = () => {
        Export.exportLibraryAsJson();
    };
    const onImportHandler = () => {
        Export.importLibraryFromJson();
    };

    const onSetLibraryCacheLocation = (value: string[]) => {
        config.cachelibraryLocation = value[0];
        setItem(StorageEntries.config, config);
    };
    const onSetTempCacheLocation = (value: string[]) => {
        config.cacheTempImageLocation = value[0];
        setItem(StorageEntries.config, config);
    };

    const onClearTempHandler = () => {
        RapunzelCache.clearTempCache();
    };
    const onClearLibraryHandler = () => {
        RapunzelCache.clearLibraryCache();
    };
    return (
        <Card>
            <Card.Content>
                <List.Section>
                    <List.Item
                        title={`Library size: ${
                            Object.keys(library.saved).length
                        } books`}
                    />
                </List.Section>
                <List.Section>
                    <Button mode="outlined" onPress={onImportHandler}>
                        Import Library from JSON
                    </Button>
                </List.Section>
                <List.Section>
                    <Button mode="outlined" onPress={onExportHandler}>
                        Export Library as JSON
                    </Button>
                </List.Section>
                <List.Section>
                    <RapunzelSelect
                        label="Library Images Cache location"
                        initialValue={[config.cachelibraryLocation]}
                        list={Object.values(ImageCacheLocations)}
                        onSelect={onSetLibraryCacheLocation}
                    />
                    <RapunzelSelect
                        label="Temporary Images Cache location"
                        initialValue={[config.cacheTempImageLocation]}
                        list={Object.values(ImageCacheLocations)}
                        onSelect={onSetTempCacheLocation}
                    />
                </List.Section>
                <List.Section>
                    <List.Item
                        title={`Library Cache size: ${librarySize.toFixed(
                            2,
                        )}MB`}
                    />
                    <List.Item
                        title={`Temp Cache size: ${tempSize.toFixed(2)}MB`}
                    />
                </List.Section>
                <List.Section>
                    <Button mode="outlined" onPress={onCalculateSizeHandler}>
                        Calculate Cache Size
                    </Button>
                </List.Section>

                <List.Section>
                    <Button mode="outlined" onPress={onClearLibraryHandler}>
                        Clear Library Images Storage
                    </Button>
                    <List.Section>
                        <Button mode="outlined" onPress={onClearTempHandler}>
                            Clear Temp Images Storage
                        </Button>
                    </List.Section>
                </List.Section>
            </Card.Content>
        </Card>
    );
};

export default CacheScreen;
