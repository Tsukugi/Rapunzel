import React, { FC, useCallback } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import CoupleItem from "../components/paper/item/coupleItem";
import { useRapunzelStore } from "../store/store";
import { useVirtualListEvents } from "../tools/useVirtualListEvents";
import { useFocusEffect } from "@react-navigation/native";
import { StorageEntries } from "../cache/interfaces";
import { useRapunzelStorage } from "../cache/storage";
import { ListUtils } from "../tools/list";
import { LibraryBook } from "../store/interfaces";
import { RapunzelLog } from "../config/log";

interface RapunzelLibraryProps extends UsesNavigation {}

const RapunzelLibrary: FC<RapunzelLibraryProps> = ({ navigation }) => {
    const {
        config: [config],
        library: [library, useLibraryEffect],
    } = useRapunzelStore();

    const [rendered, setRendered] = React.useState<string[]>([]);

    const updateLibraryFromStorage = () => {
        const storedLibrary = useRapunzelStorage().instance.getMap<
            Record<string, LibraryBook>
        >(StorageEntries.library);
        if (!storedLibrary) return;
        library.saved = storedLibrary;
        library.rendered = Object.keys(storedLibrary)
            .filter((key) => {
                const [repo] = key.split("."); // Example "Repo.BookId"
                return repo === config.repository;
            })
            .sort((a, b) => {
                if (!library.saved[a] || !library.saved[b]) return 1;
                // Sort asc (newer on top)
                return library.saved[b].savedAt - library.saved[a].savedAt;
            });

        RapunzelLog.log(
            library.rendered.map((key) => library.saved[key].cover.uri),
        );
    };

    useRouter({ route: ViewNames.RapunzelLibrary, navigation });

    useFocusEffect(
        useCallback(() => {
            updateLibraryFromStorage();
            setRendered(library.rendered);
        }, []),
    );

    useLibraryEffect(({ rendered }) => setRendered(rendered));

    const { onRemoveFromLibraryHandler, onBookSelectHandler } =
        useVirtualListEvents({ navigation });
    const { getVirtualItemProps } = useVirtualListEvents({
        navigation,
        onClick: (bookBase) =>
            onBookSelectHandler(bookBase).catch((e) => console.error(e)),
        onLongClick: async (bookBase) => {
            await onRemoveFromLibraryHandler(bookBase);
            updateLibraryFromStorage();
        },
    });

    return (
        <VirtualList
            data={ListUtils.getVirtualItemHalf(rendered)}
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
