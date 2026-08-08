import { Book } from "@atsu/lilith";
import RNFS from "react-native-fs";
import { RapunzelLog } from "../config/log";
import { getRapunzelStore } from "../store/store";
import { isCancel, pickSingle } from "react-native-document-picker";
import { getRapunzelStorage } from "./storage";
import { StorageEntries } from "./interfaces";
import { LibraryBook } from "../store/interfaces";
import { LibraryUtils } from "../tools/library";

/**
 * Exports the current library as a JSON file.
 *
 * This function retrieves the library from the `getRapunzelStore` hook,
 * serializes the `saved` books into JSON, and saves the metadata to a file
 * in the device's download directory (`RapunzelMigration/metadata.json`).
 *
 * @async
 * @function exportLibraryAsJson
 * @returns {Promise<string>} - The path of the exported JSON file.
 *
 */
const exportLibraryAsJson = async (): Promise<string> => {
    const {
        library: [library],
    } = getRapunzelStore();

    const jsonMetadata: Record<string, Book> = { ...library.saved };
    const MigrateRoot = `${RNFS.DownloadDirectoryPath}/RapunzelMigration`;

    const now = new Date();
    const dateTime = `${
        now.toISOString().split("T")[0]
    }_${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`; // yyyy-mm-dd_hh.mm.ss

    await RNFS.mkdir(MigrateRoot);
    const exportPath = `${MigrateRoot}/metadata_${dateTime}.json`;
    await RNFS.writeFile(exportPath, JSON.stringify(jsonMetadata));

    return exportPath;
};

/**
 * Imports the library from a JSON file.
 *
 * This function allows the user to select a JSON file, reads its contents, and
 * merges the imported books into the current library stored in `getRapunzelStore`.
 * It then updates the library both in memory and in persistent storage.
 *
 * @async
 * @function importLibraryFromJson
 * @returns {Promise<number | null>} - The number of imported books, or null when the picker is canceled.
 *
 * @throws {Error} If the file could not be selected or read.
 */
const importLibraryFromJson = async (): Promise<number | null> => {
    const {
        config: [config],
        library: [library],
    } = getRapunzelStore();

    let picked: Awaited<ReturnType<typeof pickSingle>>;
    try {
        picked = await pickSingle({
            mode: "open",
            copyTo: "documentDirectory",
            allowMultiSelection: false,
        });
    } catch (error) {
        if (isCancel(error)) return null;
        throw error;
    }
    if (!picked.fileCopyUri) {
        RapunzelLog.error("[importLibraryFromJson] FileCopyUri was not found");
        return null;
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

    const { setItem } = getRapunzelStorage();
    setItem(StorageEntries.library, library.saved);

    return backupKeys.length;
};

export const Export = {
    importLibraryFromJson,
    exportLibraryAsJson,
};
