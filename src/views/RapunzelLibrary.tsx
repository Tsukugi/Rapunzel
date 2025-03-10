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
import { DeviceCache } from "../cache/cache";
import { StaticLibraryPaths } from "../cache/useRapunzelCache";
import { DateUtils } from "../tools/date";

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
        // ! Enable this to use the fix
        // legacyFixUpdateAddSavedAt(storedLibrary);
        library.saved = storedLibrary;
        library.rendered = Object.keys(storedLibrary)
            .filter((key) => {
                const [repo] = key.split("."); // Example "Repo.BookId"
                return repo === config.repository;
            })
            .sort((a, b) => {
                // Sort asc (newer on top)
                return library.saved[b].savedAt - library.saved[a].savedAt;
            });

        console.log(
            library.rendered.map((key) => library.saved[key].cover.uri),
        );
    };

    const legacyFixUpdateAddSavedAt = (
        storedLibrary: Record<string, LibraryBook>,
    ) => {
        //! Update for legacy systems that didn't use LibraryBook
        const newLib: Record<string, LibraryBook> = {};
        Promise.all(
            Object.keys(storedLibrary).map(async (key) => {
                const [savedRepo, bookId] = key.split(".");
                const bookPath = `${config.cachelibraryLocation}/${StaticLibraryPaths.RootFolderName}/${StaticLibraryPaths.ReadBooks}/${savedRepo}/${bookId}`;
                const value = await DeviceCache.getFolderInfo(bookPath).catch(
                    () => null,
                );

                // ! This fixes errors in cover names
                const newUri = storedLibrary[key].cover.uri
                    .replace(".webp.webp", ".webp")
                    .replace("t.nhentai.net", "t4.nhentai.net");

                const result: LibraryBook = {
                    ...storedLibrary[key],
                    cover: {
                        ...storedLibrary[key].cover,
                        uri: newUri,
                    },
                    // ! This adds the new prop to sort
                    savedAt: value
                        ? DateUtils.getEpoch(value.ctime)
                        : DateUtils.getEpoch(new Date(2000, 11, 32)), // Old time
                };

                newLib[key] = result;
                return result;
            }),
        ).then(() => {
            library.saved = newLib;
            // ! CAUTION: This writes to the storage, please be sure before uncommenting
            // useRapunzelStorage().setItem(StorageEntries.library, newLib);
        });
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
