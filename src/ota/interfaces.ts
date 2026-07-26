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
    bundle: OtaFileManifest;
    assets: OtaFileManifest[];
    notes?: string;
}

export interface OtaManifest {
    schema: 1;
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
