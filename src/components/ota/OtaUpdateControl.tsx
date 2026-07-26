import React, { useState } from "react";
import { Button, Card, List, ProgressBar, Text } from "react-native-paper";

import { RapunzelLog } from "../../config/log";
import { OTA_BUILD_VERSION } from "../../ota/constants";
import {
    checkForOtaUpdate,
    downloadOtaUpdate,
    OtaDownloadProgress,
    OtaUpdate,
} from "../../ota/updateService";

type UpdateState =
    | "idle"
    | "checking"
    | "available"
    | "downloading"
    | "downloaded"
    | "current"
    | "error";

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : "The update could not be prepared";

const OtaUpdateControl = () => {
    const [state, setState] = useState<UpdateState>("idle");
    const [update, setUpdate] = useState<OtaUpdate | null>(null);
    const [progress, setProgress] = useState<OtaDownloadProgress | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onCheck = async () => {
        setState("checking");
        setErrorMessage(null);
        setUpdate(null);

        try {
            const result = await checkForOtaUpdate();
            if (result === null) {
                setState("current");
            } else {
                setUpdate(result);
                setState("available");
            }
        } catch (error) {
            RapunzelLog.error(
                "[OtaUpdateControl.onCheck] Update check failed",
                error,
            );
            setErrorMessage(getErrorMessage(error));
            setState("error");
        }
    };

    const onDownload = async () => {
        if (update === null) return;

        setState("downloading");
        setProgress(null);
        setErrorMessage(null);

        try {
            await downloadOtaUpdate(update, setProgress);
            setState("downloaded");
        } catch (error) {
            RapunzelLog.error(
                "[OtaUpdateControl.onDownload] Update download failed",
                error,
            );
            setErrorMessage(getErrorMessage(error));
            setState("error");
        }
    };

    const isBusy = state === "checking" || state === "downloading";
    const buttonLabel =
        state === "checking"
            ? "Checking..."
            : state === "downloading"
            ? "Downloading..."
            : state === "downloaded"
            ? "Update downloaded"
            : "Check for code update";

    return (
        <Card>
            <Card.Content>
                <List.Section style={{ gap: 8 }}>
                    <List.Item
                        title="Direct code updates"
                        description={`Installed app code: ${OTA_BUILD_VERSION}`}
                    />
                    <Text>
                        Downloads JavaScript and bundled assets directly. Native
                        app changes still need a new build.
                    </Text>
                    {state === "available" && update !== null ? (
                        <Text>
                            Version {update.platformManifest.version} is
                            available.
                            {update.platformManifest.notes
                                ? ` ${update.platformManifest.notes}`
                                : ""}
                        </Text>
                    ) : null}
                    {state === "current" ? (
                        <Text>The installed code is up to date.</Text>
                    ) : null}
                    {state === "downloaded" ? (
                        <Text>
                            The update is ready. Close and reopen the app to
                            apply it.
                        </Text>
                    ) : null}
                    {state === "downloading" && progress !== null ? (
                        <ProgressBar
                            progress={
                                progress.contentLength > 0
                                    ? progress.bytesWritten /
                                      progress.contentLength
                                    : 0
                            }
                        />
                    ) : null}
                    {state === "error" && errorMessage !== null ? (
                        <Text>{errorMessage}</Text>
                    ) : null}
                    <Button
                        mode="outlined"
                        onPress={state === "available" ? onDownload : onCheck}
                        loading={isBusy}
                        disabled={isBusy || state === "downloaded"}
                    >
                        {state === "available"
                            ? "Download update"
                            : buttonLabel}
                    </Button>
                </List.Section>
            </Card.Content>
        </Card>
    );
};

export default OtaUpdateControl;
