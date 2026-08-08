import { getLilithAPI } from "../api/api";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import {
    ConfigState,
    EAutoFetchWebviewStep,
    LilithRepo,
} from "../store/interfaces";
import { getRapunzelStore } from "../store/store";
import { RapunzelLog } from "../config/log";

type UseAutoFetchWebviewData = UsesNavigation

const SupportedSources = [LilithRepo.NHentai];
const WAIT_BEFORE_RETURN_MS = 1000;

export const createAutoFetchWebviewData = (props: UseAutoFetchWebviewData) => {
    const { navigation } = props;

    const {
        autoFetchWebview: [autoFetchWebview],
        router: [router],
        ui: [ui],
    } = getRapunzelStore();

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
                `[createAutoFetchWebviewData.validateData] Not enough data ${JSON.stringify(
                    apiLoaderConfig,
                )}`,
            );
            return false;
        }
        try {
            const trending = await getLilithAPI().getTrendingBooks(); // Test a request, should be small
            if (trending.length === 0) {
                RapunzelLog.warn(
                    "[createAutoFetchWebviewData.validateData] API returned no data",
                );
                return false;
            }
            RapunzelLog.log(
                "[createAutoFetchWebviewData.validateData] Data seems valid",
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
            `[createAutoFetchWebviewData.isSupported] ${repo} validity is ${isSupportedRepo}`,
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
        force = false,
    ) => {
        RapunzelLog.log("[createAutoFetchWebviewData.startProcess]");
        if (!isSupported(configState.repository)) {
            RapunzelLog.log(
                "[createAutoFetchWebviewData.startProcess] Can't start process",
            );
            return;
        }
        if (autoFetchWebview.step !== EAutoFetchWebviewStep.Standby) {
            if (!force) {
                RapunzelLog.log(
                    "[createAutoFetchWebviewData.startProcess] Process already started",
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
        RapunzelLog.log("[createAutoFetchWebviewData.onDataSuccess]");

        if (!(await validateData(configState))) return;

        navigateBackToReturnRoute();
    };

    const restartProcess = async (
        configState: ConfigState,
    ): Promise<boolean> => {
        RapunzelLog.log("[createAutoFetchWebviewData.restartProcess]");

        if (
            !isSupported(configState.repository) ||
            (await validateData(configState))
        ) {
            RapunzelLog.log(
                "[createAutoFetchWebviewData.restartProcess] No need to restart process",
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
