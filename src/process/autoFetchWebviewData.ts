import { useLilithAPI } from "../api/api";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import {
    ConfigState,
    EAutoFetchWebviewStep,
    LilithRepo,
} from "../store/interfaces";
import { useRapunzelStore } from "../store/store";
import { RapunzelLog } from "../config/log";

interface UseAutoFetchWebviewData extends UsesNavigation {}

const SupportedSources = [LilithRepo.NHentai];
const WAIT_BEFORE_RETURN_MS = 1000;

export const useAutoFetchWebviewData = (props: UseAutoFetchWebviewData) => {
    const { navigation } = props;

    const {
        autoFetchWebview: [autoFetchWebview],
        router: [router],
        ui: [ui],
    } = useRapunzelStore();

    const resolveReturnRoute = (): ViewNames => {
        const storedRoute = autoFetchWebview.returnRoute;
        if (storedRoute) return storedRoute;
        if (router.history.length > 1) {
            return router.history[router.history.length - 2];
        }
        if (router.history.length > 0) {
            return router.history[0];
        }
        return ViewNames.RapunzelMainFeed;
    };

    const validateData = async ({ apiLoaderConfig }: ConfigState) => {
        if (!apiLoaderConfig["User-Agent"] || !apiLoaderConfig.cookie) {
            RapunzelLog.log(
                `[useAutoFetchWebviewData.validateData] Not enough data ${JSON.stringify(
                    apiLoaderConfig,
                )}`,
            );
            return false;
        }
        try {
            await useLilithAPI().getTrendingBooks(); // Test a request, should be small
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

    const navigateBackToReturnRoute = () => {
        autoFetchWebview.step = EAutoFetchWebviewStep.ValidData;
        const routeToNavigate = resolveReturnRoute();
        ui.snackMessage =
            "Headers refreshed. Returning to your last screen...";

        setTimeout(() => {
            navigation.navigate(routeToNavigate);
            autoFetchWebview.returnRoute = null;
            autoFetchWebview.step = EAutoFetchWebviewStep.Finished;
        }, WAIT_BEFORE_RETURN_MS);
    };

    const startProcess = async (
        configState: ConfigState,
        force: boolean = false,
    ) => {
        RapunzelLog.log("[useAutoFetchWebviewData.startProcess]");
        if (!isSupported(configState.repository)) {
            RapunzelLog.log(
                "[useAutoFetchWebviewData.startProcess] Can't start process",
            );
            return;
        }
        if (autoFetchWebview.step !== EAutoFetchWebviewStep.Standby) {
            if (!force) {
                RapunzelLog.log(
                    "[useAutoFetchWebviewData.startProcess] Process already started",
                );
                return;
            }
            autoFetchWebview.step = EAutoFetchWebviewStep.Standby;
        }
        autoFetchWebview.returnRoute =
            router.currentRoute !== ViewNames.RapunzelWebView
                ? router.currentRoute
                : null;

        if (await validateData(configState)) {
            navigateBackToReturnRoute();
            return;
        }

        autoFetchWebview.step = EAutoFetchWebviewStep.Started;
        navigation.navigate(ViewNames.RapunzelWebView);
        autoFetchWebview.step = EAutoFetchWebviewStep.WaitForData;
    };

    const onDataSuccess = async (configState: ConfigState) => {
        RapunzelLog.log("[useAutoFetchWebviewData.onDataSuccess]");

        if (!(await validateData(configState))) return;

        navigateBackToReturnRoute();
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
        autoFetchWebview.step = EAutoFetchWebviewStep.Standby;
        return true;
    };

    return {
        startProcess,
        onDataSuccess,
        restartProcess,
    };
};
