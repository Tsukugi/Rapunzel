import React, { useState } from "react";
import { Alert } from "react-native";
import { DeviceCache } from "../../cache/cache";
import { Button, Card, List, Text } from "react-native-paper";
import { Export } from "../../cache/Export";
import { useRapunzelStore } from "../../store/store";
import { useRapunzelStorage } from "../../cache/storage";
import { ImageCacheLocations, StorageEntries } from "../../cache/interfaces";
import { RapunzelSelect } from "../RapunzelSelect";
import { RapunzelCache } from "../../cache/useRapunzelCache";
import { LibraryBook } from "../../store/interfaces";
import { RapunzelLog } from "../../config/log";
import { LocalTheme } from "../../../themes";

type CacheAction =
    | "import"
    | "export"
    | "migration"
    | "clearLibrary"
    | "clearTemp";

const CacheScreen = () => {
    const {
        ui: [ui],
        library: [library],
        config: [config],
    } = useRapunzelStore();
    const { setItem, instance } = useRapunzelStorage();
    const { colors } = LocalTheme.useTheme();

    const [tempSize, setTempSize] = useState(0);
    const [librarySize, setLibrarySize] = useState(0);

    const [isCacheSizeLoading, setIsCacheSizeLoading] = useState(false);
    const [activeAction, setActiveAction] = useState<CacheAction | null>(null);

    const isBusy = isCacheSizeLoading || activeAction !== null;

    const runAction = async <T,>(
        action: CacheAction,
        operation: () => Promise<T>,
        getSuccessMessage: (result: T) => string | null,
        failureMessage: string,
    ) => {
        if (isBusy) return;

        setActiveAction(action);
        try {
            const result = await operation();
            const successMessage = getSuccessMessage(result);
            if (successMessage) ui.snackMessage = successMessage;
        } catch (error) {
            RapunzelLog.error(`[CacheScreen.${action}] Action failed`, error);
            ui.snackMessage = failureMessage;
        } finally {
            setActiveAction(null);
        }
    };

    const onCalculateSizeHandler = () => {
        if (isBusy) return;

        setIsCacheSizeLoading(true);
        const temp = DeviceCache.calculateCacheSize(
            config.cacheTempImageLocation,
        ).then(setTempSize);
        const library = DeviceCache.calculateCacheSize(
            config.cachelibraryLocation,
        ).then(setLibrarySize);

        Promise.allSettled([temp, library])
            .then((results) => {
                if (results.some((result) => result.status === "rejected")) {
                    ui.snackMessage = "Could not calculate cache size";
                }
            })
            .finally(() => setIsCacheSizeLoading(false));
    };
    const onExportHandler = () => {
        void runAction(
            "export",
            Export.exportLibraryAsJson,
            () => "Library exported",
            "Could not export library",
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

    const onImportHandler = () => {
        if (isBusy) return;

        Alert.alert(
            "Import library?",
            "The selected backup will be merged into your current library. Existing matching books will be replaced.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Choose backup",
                    onPress: () =>
                        void runAction(
                            "import",
                            Export.importLibraryFromJson,
                            (count) =>
                                count === null
                                    ? null
                                    : `Imported ${count} library book${
                                          count === 1 ? "" : "s"
                                      }`,
                            "Could not import library",
                        ),
                },
            ],
            { cancelable: true },
        );
    };

    const onApplyLibraryBookFixHandler = async () => {
        const storedLibrary = instance.getMap<
            Record<string, LibraryBook>
        >(StorageEntries.library);
        await RapunzelCache.applyLibraryBookAndCoverStoragePatch(
            storedLibrary,
            (newLibrary) => {
                library.saved = newLibrary;
                setItem(StorageEntries.library, newLibrary);
            },
        );
    };

    const onClearTempHandler = () => {
        return RapunzelCache.clearTempCache().then((cleared) => {
            if (!cleared) throw new Error("Temporary cache was not cleared");
        });
    };
    const onClearLibraryHandler = () => {
        return RapunzelCache.clearLibraryCache().then((cleared) => {
            if (!cleared) throw new Error("Library cache was not cleared");
        });
    };

    const confirmDangerousAction = (
        title: string,
        message: string,
        confirmLabel: string,
        action: () => Promise<void>,
        successMessage: string,
        failureMessage: string,
        actionId: CacheAction,
    ) => {
        if (isBusy) return;

        Alert.alert(
            title,
            message,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: confirmLabel,
                    style: "destructive",
                    onPress: () =>
                        void runAction(
                            actionId,
                            action,
                            () => successMessage,
                            failureMessage,
                        ),
                },
            ],
            { cancelable: true },
        );
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
                    <Button
                        mode="outlined"
                        onPress={onImportHandler}
                        loading={activeAction === "import"}
                        disabled={isBusy}
                    >
                        Import Library from JSON
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={onExportHandler}
                        loading={activeAction === "export"}
                        disabled={isBusy}
                    >
                        Export Library as JSON
                    </Button>
                </List.Section>
                <List.Section>
                    <RapunzelSelect
                        label="Library Images Cache location"
                        initialValue={[config.cachelibraryLocation]}
                        list={Object.values(ImageCacheLocations)}
                        disabled={isBusy}
                        onSelect={onSetLibraryCacheLocation}
                    />
                    <RapunzelSelect
                        label="Temporary Images Cache location"
                        initialValue={[config.cacheTempImageLocation]}
                        list={Object.values(ImageCacheLocations)}
                        disabled={isBusy}
                        onSelect={onSetTempCacheLocation}
                    />
                </List.Section>
                <List.Section>
                    <Button
                        mode="outlined"
                        onPress={onCalculateSizeHandler}
                        loading={isCacheSizeLoading}
                        disabled={activeAction !== null}
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
                        borderColor: colors.error,
                        borderStyle: "solid",
                        borderWidth: 2,
                        padding: 12,
                        marginVertical: 20,
                        backgroundColor: colors.errorContainer,
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
                        <Text
                            style={{
                                fontSize: 20,
                                color: colors.onErrorContainer,
                            }}
                        >
                            Danger Zone
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                color: colors.onErrorContainer,
                            }}
                        >
                            Actions ask for confirmation before they run
                        </Text>
                    </List.Section>
                    <List.Section style={{ gap: 12 }}>
                        <Button
                            mode="contained"
                            buttonColor={colors.error}
                            textColor={colors.onError}
                            onPress={() =>
                                confirmDangerousAction(
                                    "Update library structure?",
                                    "This will update saved library metadata for the current storage format.",
                                    "Update library",
                                    onApplyLibraryBookFixHandler,
                                    "Library updated",
                                    "Could not update library",
                                    "migration",
                                )
                            }
                            loading={activeAction === "migration"}
                            disabled={isBusy}
                        >
                            Update Library to 0.6.12+ structure
                        </Button>
                        <Button
                            mode="contained"
                            buttonColor={colors.error}
                            textColor={colors.onError}
                            onPress={() =>
                                confirmDangerousAction(
                                    "Clear library images?",
                                    "This deletes downloaded library images. Your saved book list will remain.",
                                    "Clear library images",
                                    onClearLibraryHandler,
                                    "Library images cleared",
                                    "Could not clear library images",
                                    "clearLibrary",
                                )
                            }
                            loading={activeAction === "clearLibrary"}
                            disabled={isBusy}
                        >
                            Clear Library Images Storage
                        </Button>
                        <Button
                            mode="contained"
                            buttonColor={colors.error}
                            textColor={colors.onError}
                            onPress={() =>
                                confirmDangerousAction(
                                    "Clear temporary images?",
                                    "This deletes temporary downloaded images. Your library images will remain.",
                                    "Clear temporary images",
                                    onClearTempHandler,
                                    "Temporary images cleared",
                                    "Could not clear temporary images",
                                    "clearTemp",
                                )
                            }
                            loading={activeAction === "clearTemp"}
                            disabled={isBusy}
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
