export type OtaPlatform = "android" | "ios";

export interface OtaFileManifest {
    path: string;
    url: string;
    sha256: string;
    bytes: number;
}

export interface OtaPlatformManifest {
    version: string;
    nativeCompatibility: string;
    archive: OtaFileManifest;
    bundlePath: string;
    notes?: string;
}

export interface OtaManifest {
    schema: 2;
    platforms: Partial<Record<OtaPlatform, OtaPlatformManifest>>;
}

export interface OtaBundleReference {
    version: string;
    nativeCompatibility: string;
    bundlePath: string;
    assetRoot: string;
}

export interface OtaActiveRecord {
    schema: 1;
    nativeCompatibility: string;
    current?: OtaBundleReference;
    pending?: OtaBundleReference & {
        attempted: boolean;
    };
}
