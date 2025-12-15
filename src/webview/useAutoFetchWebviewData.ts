import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RapunzelLog } from "../config/log";
import { useRapunzelLoader } from "../api/loader";
import {
    ConfigState,
    EAutoFetchWebviewStep,
    LilithRepo,
    ViewNames,
    useRapunzelStore,
} from "../store";
import { RootDrawerParamList } from "../navigation/AppNavigator";

interface UseAutoFetchWebviewDataProps {
    navigation: DrawerNavigationProp<
        RootDrawerParamList,
        ViewNames.RapunzelWebView
    >;
}

const SupportedSources = [LilithRepo.NHentai];

export const useAutoFetchWebviewData = ({
    navigation,
}: UseAutoFetchWebviewDataProps) => {
    const {
        autoFetchWebview: [autoFetchWebview],
    } = useRapunzelStore();
    const loader = useRapunzelLoader();

    const validateData = async ({ apiLoaderConfig }: ConfigState) => {
        if (!apiLoaderConfig["User-Agent"] || !apiLoaderConfig.cookie) {
            RapunzelLog.log(
                `[useAutoFetchWebviewData.validateData] Missing headers ${JSON.stringify(
                    apiLoaderConfig,
                )}`,
            );
            return false;
        }
        try {
            await loader.getTrendingBooks();
            RapunzelLog.log(
                "[useAutoFetchWebviewData.validateData] Headers look valid",
            );
            return true;
        } catch (error) {
            RapunzelLog.error(error);
            return false;
        }
    };

    const isSupported = (repo: LilithRepo) => {
        const ok = SupportedSources.includes(repo);
        RapunzelLog.log(
            `[useAutoFetchWebviewData.isSupported] ${repo} => ${ok}`,
        );
        return ok;
    };

    const startProcess = (configState: ConfigState) => {
        RapunzelLog.log("[useAutoFetchWebviewData.startProcess]");
        if (
            autoFetchWebview.step !== EAutoFetchWebviewStep.Standby ||
            !isSupported(configState.repository)
        ) {
            return;
        }
        autoFetchWebview.step = EAutoFetchWebviewStep.Started;
        navigation.navigate(ViewNames.RapunzelWebView);
        autoFetchWebview.step = EAutoFetchWebviewStep.WaitForData;
    };

    const onDataSuccess = async (configState: ConfigState) => {
        RapunzelLog.log("[useAutoFetchWebviewData.onDataSuccess]");

        if (!(await validateData(configState))) return;

        autoFetchWebview.step = EAutoFetchWebviewStep.ValidData;
        navigation.navigate(ViewNames.RapunzelMainFeed);
        autoFetchWebview.step = EAutoFetchWebviewStep.Finished;
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
                "[useAutoFetchWebviewData.restartProcess] No need to restart",
            );
            return false;
        }
        autoFetchWebview.step = EAutoFetchWebviewStep.Standby;
        return true;
    };

    return {
        startProcess,
        onDataSuccess,
        restartProcess,
    };
};
