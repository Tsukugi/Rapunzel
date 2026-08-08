import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { UsesNavigation, ViewNames } from "./interfaces";
import { getRapunzelStore } from "../../store/store";
import { getRapunzelStorage } from "../../cache/storage";
import { StorageEntries } from "../../cache/interfaces";
import { Alert, BackHandler } from "react-native";
import { RapunzelLog } from "../../config/log";
import { RapunzelCache } from "../../cache/useRapunzelCache";

interface UseRouterProps extends UsesNavigation {
    route: ViewNames;
}

const HomeRoute = ViewNames.RapunzelBrowse;

export const useRouter = ({ route, navigation }: UseRouterProps) => {
    const {
        router: [router],
    } = getRapunzelStore();

    const onExitHandler = React.useCallback(async () => {
        await RapunzelCache.clearTempCache();
        BackHandler.exitApp();
    }, []);

    const showExitAlert = React.useCallback(
        (onExit: () => void) => {
            Alert.alert(
                "Exiting Rapunzel",
                "Do you want to exit?",
                [
                    {
                        text: "Cancel",
                        onPress: () => RapunzelLog.log("Cancel Pressed"),
                        style: "cancel",
                    },
                    {
                        text: "Exit!",
                        onPress: onExit,
                    },
                ],
                { cancelable: false },
            );
        },
        [],
    );

    useFocusEffect(
        React.useCallback(() => {
            router.currentRoute = route;
            if (route === HomeRoute) {
                router.history = [route];
            } else if (router.history[router.history.length - 1] !== route) {
                router.history = [...router.history, route];
            }
            getRapunzelStorage().setItem(StorageEntries.currentRoute, route);
        }, [route, router]),
    );

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    showExitAlert(onExitHandler);
                }
                return true;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress,
            );

            return () => subscription.remove();
        }, [navigation, onExitHandler, showExitAlert]),
    );
};
