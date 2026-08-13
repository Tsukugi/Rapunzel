import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import VirtualList from "../components/virtualList/virtualList";
import ImageRenderer from "../components/virtualList/imageItem";
import { getReaderPageLayout } from "../components/virtualList/readerLayout";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import ReaderHeader from "../components/reader/readerHeader";
import { StorageEntries } from "../cache/interfaces";
import { getRapunzelStorage } from "../cache/storage";
import {
    LibraryBook,
    LibraryState,
    RapunzelImage,
    ReaderState,
    ReaderImageFit,
    ReaderMode,
} from "../store/interfaces";
import { getRapunzelStore } from "../store/store";
import { getRapunzelLibrary } from "../components/cache/library";
import { ListUtils } from "../tools/list";
import { useReaderHeaderVisibility } from "../tools/useReaderHeaderVisibility";
import { RapunzelLog } from "../config/log";

type RapunzelReaderProps = UsesNavigation;

const RapunzelReader: FC<RapunzelReaderProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<
        VirtualItem<RapunzelImage>[]
    >([]);
    const [singlePageIndex, setSinglePageIndex] = useState(0);
    const {
        reader: [reader, readerEffect],
        library: [library, libraryEffect],
    } = getRapunzelStore();
    const { getLibraryId, saveBookToLibrary, removeBookFromLibrary } =
        getRapunzelLibrary();
    const getLibraryIdRef = useRef(getLibraryId);
    getLibraryIdRef.current = getLibraryId;
    const { setItem: setStorageItem } = getRapunzelStorage();
    const currentBookRef = useRef(reader.book);
    currentBookRef.current = reader.book;
    const currentReaderRef = useRef(reader);
    currentReaderRef.current = reader;
    const [isSaved, setIsSaved] = useState(false);

    const readerMode = reader.mode || ReaderMode.Scroll;
    const readerImageFit = reader.imageFit || ReaderImageFit.Width;
    const readerViewportWidth = Dimensions.get("screen").width;
    const readerViewportHeight = Dimensions.get("screen").height;
    const getItemLayout = useCallback(
        (
            data: ArrayLike<VirtualItem<RapunzelImage>> | null | undefined,
            index: number,
        ) =>
            getReaderPageLayout(data, index, readerImageFit, {
                width: readerViewportWidth,
                height: readerViewportHeight,
            }),
        [
            readerImageFit,
            readerViewportWidth,
            readerViewportHeight,
        ],
    );
    const { visible: headerVisible, onScroll: onReaderScroll } =
        useReaderHeaderVisibility(
            String(reader.chapter?.id || ""),
        );

    const updateImages = useCallback(() => {
        setLoadedImages(currentReaderRef.current.cachedImages);
    }, []);

    useRouter({ route: ViewNames.RapunzelReader, navigation });

    useFocusEffect(
        useCallback(() => {
            updateImages();
        }, [updateImages]),
    );

    const onReaderUpdate = useCallback(({ cachedImages }: ReaderState) => {
        setLoadedImages((current) =>
            cachedImages.length === 0
                ? []
                : ListUtils.mergeVirtualItems(current, cachedImages),
        );
    }, []);

    readerEffect(onReaderUpdate);

    useEffect(() => {
        setSinglePageIndex(0);
    }, [reader.chapter?.id]);

    const updateSavedState = useCallback(
        (saved: Record<string, LibraryBook>) => {
            const book = currentBookRef.current;
            setIsSaved(
                !!book && !!saved[getLibraryIdRef.current(book.id)],
            );
        },
        [],
    );

    useEffect(() => {
        updateSavedState(library.saved);
    }, [library.saved, reader.book?.id, updateSavedState]);

    const onLibraryUpdate = useCallback(
        ({ saved }: LibraryState) => updateSavedState(saved),
        [updateSavedState],
    );

    libraryEffect(onLibraryUpdate);

    useEffect(() => {
        setSinglePageIndex((current) =>
            loadedImages.length === 0
                ? 0
                : Math.min(current, loadedImages.length - 1),
        );
    }, [loadedImages.length]);

    const persistReaderSettings = useCallback(
        (nextMode: ReaderMode, nextImageFit: ReaderImageFit) => {
            reader.mode = nextMode;
            reader.imageFit = nextImageFit;
            setStorageItem(StorageEntries.readerSettings, {
                mode: nextMode,
                imageFit: nextImageFit,
            });
        },
        [reader, setStorageItem],
    );

    const onModeChange = useCallback(
        (mode: ReaderMode) => {
            persistReaderSettings(mode, readerImageFit);
            if (mode === ReaderMode.SinglePage) {
                setSinglePageIndex(0);
            }
        },
        [persistReaderSettings, readerImageFit],
    );

    const onImageFitChange = useCallback(
        (imageFit: ReaderImageFit) => {
            persistReaderSettings(readerMode, imageFit);
        },
        [persistReaderSettings, readerMode],
    );

    const onToggleSaved = useCallback(() => {
        if (!reader.book) return;

        const libraryId = getLibraryId(reader.book.id);
        const saveAction = library.saved[libraryId]
            ? removeBookFromLibrary(reader.book)
            : saveBookToLibrary(reader.book);

        void saveAction.catch((error) =>
            RapunzelLog.error(
                "[RapunzelReader] Could not update saved book",
                error,
            ),
        );
    }, [
        getLibraryId,
        library.saved,
        reader.book,
        removeBookFromLibrary,
        saveBookToLibrary,
    ]);

    const goToPreviousPage = useCallback(() => {
        setSinglePageIndex((current) => Math.max(0, current - 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setSinglePageIndex((current) =>
            Math.min(loadedImages.length - 1, current + 1),
        );
    }, [loadedImages.length]);

    const renderSinglePage = () => {
        if (loadedImages.length === 0) return null;

        const item = loadedImages[singlePageIndex];
        if (!item) return null;

        return (
            <View style={styles.singlePage}>
                <ImageRenderer item={item} imageFit={readerImageFit} />
                <View style={styles.tapAreas} pointerEvents="box-none">
                    <Pressable
                        accessibilityLabel="Previous page"
                        accessibilityRole="button"
                        disabled={singlePageIndex === 0}
                        onPress={goToPreviousPage}
                        style={styles.tapArea}
                    />
                    <Pressable
                        accessibilityLabel="Next page"
                        accessibilityRole="button"
                        disabled={singlePageIndex >= loadedImages.length - 1}
                        onPress={goToNextPage}
                        style={styles.tapArea}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {readerMode === ReaderMode.SinglePage ? (
                renderSinglePage()
            ) : (
                <VirtualList
                    data={loadedImages}
                    getItemLayout={getItemLayout}
                    onRefresh={async () => updateImages()}
                    onScroll={onReaderScroll}
                    renderer={({ item }) => (
                        <ImageRenderer item={item} imageFit={readerImageFit} />
                    )}
                />
            )}
            <ReaderHeader
                navigation={navigation}
                title={reader.book?.title || "Reader"}
                visible={headerVisible}
                saved={isSaved}
                mode={readerMode}
                imageFit={readerImageFit}
                onToggleSaved={onToggleSaved}
                onModeChange={onModeChange}
                onImageFitChange={onImageFitChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    singlePage: {
        flex: 1,
    },
    tapAreas: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        flexDirection: "row",
    },
    tapArea: {
        flex: 1,
    },
});

export default RapunzelReader;
