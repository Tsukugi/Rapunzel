import { LilithRepo } from "@atsu/lilith";
import { useRapunzelLoader } from "../api/loader";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { ConfigState, EAutoFetchWebviewStep } from "../store/interfaces";
import { useRapunzelStore } from "../store/store";
import { RapunzelLog } from "../config/log";

interface UseAutoFetchWebviewData extends UsesNavigation {}

const SupportedSources = [LilithRepo.NHentai];

export const useAutoFetchWebviewData = (props: UseAutoFetchWebviewData) => {
    const { navigation } = props;

    const getStoreData = () => {
        const {
            autoFetchWebview: [autoFetchWebview],
        } = useRapunzelStore();
        return autoFetchWebview;
    };

    const validateData = async ({ apiLoaderConfig }: ConfigState) => {
        if (!apiLoaderConfig["User-Agent"] || !apiLoaderConfig.cookie) {
            RapunzelLog.log(
                `[useAutoFetchWebviewData.validateData] Not enough data ${JSON.stringify(apiLoaderConfig)}`,
            );
            return false;
        }
        try {
            await useRapunzelLoader().getTrendingBooks(); // Test a request, should be small
            RapunzelLog.log(
                "[useAutoFetchWebviewData.validateData] Data seems valid",
            );
            return true;
        } catch (err) {
            RapunzelLog.error(err);
            return false;
        }
    };

    const isSupported = (repo: LilithRepo): boolean => {
        const isSupportedRepo = SupportedSources.includes(repo);
        RapunzelLog.log(
            `[useAutoFetchWebviewData.isSupported] ${repo} validity is ${isSupportedRepo}`,
        );
        return isSupportedRepo;
    };

    const startProcess = (configState: ConfigState) => {
        RapunzelLog.log("[useAutoFetchWebviewData.startProcess]");
        if (
            getStoreData().step !== EAutoFetchWebviewStep.Standby ||
            !isSupported(configState.repository)
        ) {
            RapunzelLog.log(
                "[useAutoFetchWebviewData.startProcess] Can't start process",
            );
            return;
        }
        getStoreData().step = EAutoFetchWebviewStep.Started;
        navigation.navigate(ViewNames.RapunzelWebView);
        getStoreData().step = EAutoFetchWebviewStep.WaitForData;
    };

    const onDataSuccess = async (configState: ConfigState) => {
        RapunzelLog.log("[useAutoFetchWebviewData.onDataSuccess]");

        if (!(await validateData(configState))) return;

        getStoreData().step = EAutoFetchWebviewStep.ValidData;
        navigation.navigate(ViewNames.RapunzelMainFeed);
        getStoreData().step = EAutoFetchWebviewStep.Finished;
    };

    const restartProcess = async (
        configState: ConfigState,
    ): Promise<boolean> => {
        RapunzelLog.log("[useAutoFetchWebviewData.restartProcess]");

        if (
            !isSupported(configState.repository) ||
            (await validateData(configState))
        ) {
            RapunzelLog.log(
                "[useAutoFetchWebviewData.restartProcess] No need to restart process",
            );
            RapunzelLog.log({ configState });
            return false;
        }
        getStoreData().step = EAutoFetchWebviewStep.Standby;
        return true;
    };

    return {
        startProcess,
        onDataSuccess,
        restartProcess,
    };
};
