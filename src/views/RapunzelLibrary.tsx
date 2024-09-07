import React, { FC, useCallback } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import CoupleItem from "../components/paper/item/coupleItem";
import { useRapunzelStore } from "../store/store";
import { useVirtualListEvents } from "../tools/useVirtualListEvents";
import { useFocusEffect } from "@react-navigation/native";
import { StorageEntries } from "../cache/interfaces";
import { useRapunzelStorage } from "../cache/storage";
import { Book } from "@atsu/lilith";

interface RapunzelLibraryProps extends UsesNavigation {}

const RapunzelLibrary: FC<RapunzelLibraryProps> = ({ navigation }) => {
    const {
        loading: [, useLoadingEffect],
        header: [header],
        library: [library],
    } = useRapunzelStore();

    const updateLibraryFromStorage = async () => {
        const storedLibrary = await useRapunzelStorage().instance.getMapAsync<
            Record<string, Book>
        >(StorageEntries.library);
        if (!storedLibrary) return;
        library.saved = storedLibrary;
        library.rendered = Object.keys(storedLibrary);
    };

    useRouter({ route: ViewNames.RapunzelLibrary, navigation });

    useFocusEffect(
        useCallback(() => {
            updateLibraryFromStorage();
        }, []),
    );

    const { onRemoveFromLibraryHandler, onBookSelectHandler } =
        useVirtualListEvents({ navigation });
    const { getVirtualItemProps } = useVirtualListEvents({
        navigation,
        onClick: onBookSelectHandler,
        onLongClick: async (bookBase) => {
            const removePromise = onRemoveFromLibraryHandler(bookBase);
            library.rendered = library.rendered.filter(
                (id) => id !== bookBase.id,
            );
            return await removePromise;
        },
    });

    /**
     * We filter even images so we have half of the elements but each will have both as [odd, even]
     */
    const oddImagesOnly = library.rendered
        .map((bookId, index) => {
            return {
                id: `${index}`,
                index,
                value: library.saved[bookId],
            } as VirtualItem<Book>;
        })
        .filter((item) => item.index % 2 === 1);

    return (
        <VirtualList
            data={oddImagesOnly}
            renderer={({ index }) => {
                const [leftBook, rightBook] = [
                    library.saved[library.rendered[index * 2]],
                    library.saved[library.rendered[index * 2 + 1]],
                ];
                return (
                    <CoupleItem
                        couple={[
                            getVirtualItemProps(leftBook),
                            getVirtualItemProps(rightBook),
                        ]}
                    />
                );
            }}
        />
    );
};
export default RapunzelLibrary;
