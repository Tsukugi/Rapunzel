import React, { useState } from "react";
import { DeviceCache } from "../../cache/cache";
import { Button, Card, List, Text } from "react-native-paper";
import { Export } from "../../cache/Export";
import { useRapunzelStore } from "../../store/store";
import { useRapunzelStorage } from "../../cache/storage";
import { ImageCacheLocations, StorageEntries } from "../../cache/interfaces";
import { RapunzelSelect } from "../RapunzelSelect";
import { RapunzelCache } from "../../cache/useRapunzelCache";
import { LibraryBook } from "../../store/interfaces";

const CacheScreen = () => {
    const {
        ui: [ui],
        library: [library],
        config: [config],
    } = useRapunzelStore();
    const { setItem } = useRapunzelStorage();

    const [tempSize, setTempSize] = useState(0);
    const [librarySize, setLibrarySize] = useState(0);

    const [isCacheSizeLoading, setIsCacheSizeLoading] = useState(false);

    const onCalculateSizeHandler = () => {
        setIsCacheSizeLoading(true);
        const temp = DeviceCache.calculateCacheSize(
            config.cacheTempImageLocation,
        ).then(setTempSize);
        const library = DeviceCache.calculateCacheSize(
            config.cachelibraryLocation,
        ).then(setLibrarySize);

        Promise.allSettled([temp, library]).finally(() =>
            setIsCacheSizeLoading(false),
        );
    };
    const onExportHandler = () => {
        Export.exportLibraryAsJson();
    };
    const onImportHandler = () => {
        Export.importLibraryFromJson();
    };

    const onApplyLibraryBookFixHandler = () => {
        const storedLibrary = useRapunzelStorage().instance.getMap<
            Record<string, LibraryBook>
        >(StorageEntries.library);
        RapunzelCache.applyLibraryBookAndCoverStoragePatch(
            storedLibrary,
            (newLibrary) => {
                library.saved = newLibrary;
                // ! CAUTION: This writes to the storage, please be sure before uncommenting
                useRapunzelStorage().setItem(
                    StorageEntries.library,
                    newLibrary,
                );
                ui.snackMessage = "Patch applied successfully";
            },
        );
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
                <List.Section style={{ gap: 8 }}>
                    <List.Item
                        title={`Library size: ${
                            Object.keys(library.saved).length
                        } books`}
                    />
                    <Button mode="outlined" onPress={onImportHandler}>
                        Import Library from JSON
                    </Button>
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
                    <Button
                        mode="outlined"
                        onPress={onCalculateSizeHandler}
                        loading={isCacheSizeLoading}
                    >
                        Calculate Cache Size
                    </Button>
                    <List.Item
                        title={`Library Cache size: ${librarySize.toFixed(
                            2,
                        )}MB`}
                    />
                    <List.Item
                        title={`Temp Cache size: ${tempSize.toFixed(2)}MB`}
                    />
                </List.Section>
                <List.Section
                    style={{
                        borderColor: "#aa5555",
                        borderStyle: "solid",
                        borderWidth: 2,
                        padding: 12,
                        marginVertical: 20,
                        backgroundColor: "#ff5555",
                        opacity: 0.6,
                        borderRadius: 30,
                    }}
                >
                    <List.Section
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            paddingHorizontal: 12,
                        }}
                    >
                        <Text style={{ fontSize: 20 }}>Danger Zone</Text>
                        <Text style={{ fontSize: 12 }}>
                            Long press to confirm
                        </Text>
                    </List.Section>
                    <List.Section style={{ gap: 12 }}>
                        <Button
                            mode="contained"
                            onLongPress={onApplyLibraryBookFixHandler}
                        >
                            Update Library to 0.6.12+ structure
                        </Button>
                        <Button
                            mode="contained"
                            onLongPress={onClearLibraryHandler}
                        >
                            Clear Library Images Storage
                        </Button>
                        <Button
                            mode="contained"
                            onLongPress={onClearTempHandler}
                        >
                            Clear Temp Images Storage
                        </Button>
                    </List.Section>
                </List.Section>
            </Card.Content>
        </Card>
    );
};

export default CacheScreen;
