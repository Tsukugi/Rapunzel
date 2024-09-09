import { Book } from "@atsu/lilith";
import RNFS from "react-native-fs";
import { RapunzelLog } from "../config/log";
import { useRapunzelStore } from "../store/store";
import { CacheUtils } from "./CacheUtils";
import { DeviceCache } from "./cache";

const exportLibraryAsJson = async () => {
    const {
        library: [library],
    } = useRapunzelStore();

    const jsonMetadata: Record<string, Book> = { ...library.saved };
    const MigrateRoot = `${RNFS.DownloadDirectoryPath}/RapunzelMigration`;

    await RNFS.mkdir(MigrateRoot);
    await RNFS.writeFile(
        `${MigrateRoot}/metadata.json`,
        JSON.stringify(jsonMetadata),
    );
};

const migrateCachedImages = async () => {
    const ignoreUnrelatedFiles = ["mmkv", "BridgeReactNativeDevBundle.js"];

    const MigrateSourcePath = DeviceCache.ImageCacheDirectory;
    const MigrateRoot = `${RNFS.DownloadDirectoryPath}/RapunzelMigration`;

    const onEachItemMigration = async (item: RNFS.ReadDirItem) => {
        if (ignoreUnrelatedFiles.includes(item.name) || item.isDirectory())
            return;

        RapunzelLog.log(`Copy ${item.name}`);

        await RNFS.copyFile(
            `${MigrateSourcePath}/${item.name}`,
            `${MigrateRoot}/${item.name}`,
        ).catch(RapunzelLog.error);
    };

    const items = await RNFS.readDir(MigrateSourcePath);
    RapunzelLog.log(`Copy ${items.length} items`);
    await RNFS.mkdir(MigrateRoot);

    let progress = 0;

    const interval = setInterval(() => {
        if (progress >= items.length) {
            clearInterval(interval);
            RapunzelLog.log(`Copied ${items.length} items`);
        }
        RapunzelLog.log(`Progress ${progress}/${items.length}`);
        onEachItemMigration(items[progress]);
        progress++;
    }, 20);
};

const migrateCachedImagesWithStructure = async () => {
    const {
        config: [config],
    } = useRapunzelStore();

    const ignoreUnrelatedFiles = ["mmkv", "BridgeReactNativeDevBundle.js"];

    const MigrateSourcePath = DeviceCache.ImageCacheDirectory;
    const MigrateRoot = `${RNFS.DownloadDirectoryPath}/RapunzelMigration`;

    const onEachItemMigration = async (item: RNFS.ReadDirItem) => {
        if (ignoreUnrelatedFiles.includes(item.name) || item.isDirectory())
            return;

        const info = CacheUtils.getFilenameInfo(item.name);

        const RapunzelId = `${config.repository}.${info.id}`;

        const bookFolderPath = `${MigrateRoot}/${RapunzelId}`;
        await RNFS.mkdir(bookFolderPath);

        RapunzelLog.log(`Copy ${item.name}`);

        await RNFS.copyFile(
            `${MigrateSourcePath}/${item.name}`,
            `${bookFolderPath}/${item.name}`,
        ).catch(RapunzelLog.error);
    };

    const items = await RNFS.readDir(MigrateSourcePath);
    await RNFS.mkdir(MigrateRoot);
    const copyProcesses = items.map(onEachItemMigration);

    return copyProcesses;
};

export const Export = {
    migrateCachedImages,
    migrateCachedImagesWithStructure,
    exportLibraryAsJson,
};
