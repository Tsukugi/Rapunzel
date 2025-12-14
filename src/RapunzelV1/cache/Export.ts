import { Book } from "@atsu/lilith";
import RNFS from "react-native-fs";
import { RapunzelLog } from "../config/log";
import { useRapunzelStore } from "../store/store";
import { pickSingle } from "react-native-document-picker";
import { useRapunzelStorage } from "./storage";
import { StorageEntries } from "./interfaces";
import { LibraryBook } from "../store/interfaces";
import { LibraryUtils } from "../tools/library";

/**
 * Exports the current library as a JSON file.
 *
 * This function retrieves the library from the `useRapunzelStore` hook,
 * serializes the `saved` books into JSON, and saves the metadata to a file
 * in the device's download directory (`RapunzelMigration/metadata.json`).
 *
 * @async
 * @function exportLibraryAsJson
 * @returns {Promise<void>} - A promise that resolves when the export is complete.
 *
 */
const exportLibraryAsJson = async () => {
    const {
        library: [library],
    } = useRapunzelStore();

    const jsonMetadata: Record<string, Book> = { ...library.saved };
    const MigrateRoot = `${RNFS.DownloadDirectoryPath}/RapunzelMigration`;

    const now = new Date();
    const dateTime = `${
        now.toISOString().split("T")[0]
    }_${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`; // yyyy-mm-dd_hh.mm.ss

    await RNFS.mkdir(MigrateRoot);
    await RNFS.writeFile(
        `${MigrateRoot}/metadata_${dateTime}.json`,
        JSON.stringify(jsonMetadata),
    );
};

/**
 * Imports the library from a JSON file.
 *
 * This function allows the user to select a JSON file, reads its contents, and
 * merges the imported books into the current library stored in `useRapunzelStore`.
 * It then updates the library both in memory and in persistent storage.
 *
 * @async
 * @function importLibraryFromJson
 * @returns {Promise<void>} - A promise that resolves when the import is complete.
 *
 * @throws {Error} If the file could not be selected or read.
 */
const importLibraryFromJson = async () => {
    const {
        config: [config],
        library: [library],
    } = useRapunzelStore();

    const picked = await pickSingle({
        mode: "open",
        copyTo: "documentDirectory",
        allowMultiSelection: false,
    });
    if (!picked.fileCopyUri) {
        RapunzelLog.error("[importLibraryFromJson] FileCopyUri was not found");
        return;
    }
    const backup = await RNFS.readFile(picked.fileCopyUri);
    const parsedBackup: Record<string, LibraryBook> = JSON.parse(backup);
    const backupKeys = Object.keys(parsedBackup);
    RapunzelLog.log(backupKeys.map((key) => parsedBackup[key].title));
    RapunzelLog.log(
        `$[importLibraryFromJson] importing ${backupKeys.length} entries`,
    );

    const { rendered, saved } = LibraryUtils.buildLibraryState(
        { ...library.saved, ...parsedBackup },
        config,
    );
    library.saved = saved;
    library.rendered = rendered;

    const { setItem } = useRapunzelStorage();
    setItem(StorageEntries.library, library.saved);
};

export const Export = {
    importLibraryFromJson,
    exportLibraryAsJson,
};
