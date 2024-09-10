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
import { Book } from "@atsu/lilith";
import { ListUtils } from "../tools/list";

interface RapunzelLibraryProps extends UsesNavigation {}

const RapunzelLibrary: FC<RapunzelLibraryProps> = ({ navigation }) => {
    const {
        library: [library, useLibraryEffect],
    } = useRapunzelStore();

    const [rendered, setRendered] = React.useState<string[]>([]);

    const updateLibraryFromStorage = () => {
        const storedLibrary = useRapunzelStorage().instance.getMap<
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
            setRendered(library.rendered);
        }, []),
    );

    useLibraryEffect(({ rendered }) => setRendered(rendered));

    const { onRemoveFromLibraryHandler, onBookSelectHandler } =
        useVirtualListEvents({ navigation });
    const { getVirtualItemProps } = useVirtualListEvents({
        navigation,
        onClick: onBookSelectHandler,
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
