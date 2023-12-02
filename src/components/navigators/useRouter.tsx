import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { UsesNavigation, ViewNames } from "./interfaces";
import { useRapunzelStore } from "../../store/store";
import { useRapunzelStorage } from "../../cache/storage";
import { StorageEntries } from "../../cache/interfaces";
import { BackHandler } from "react-native";

interface UseRouterProps extends UsesNavigation {
    route: ViewNames;
}

const HomeRoute = ViewNames.RapunzelBrowse;

export const useRouter = ({ route, navigation }: UseRouterProps) => {
    const {
        router: [router],
    } = useRapunzelStore();

    useFocusEffect(
        React.useCallback(() => {
            router.currentRoute = route;
            if (route === HomeRoute) {
                router.history = [route];
            } else if (router.history[router.history.length - 1] !== route) {
                router.history = [...router.history, route];
            }
            useRapunzelStorage().setItem(StorageEntries.currentRoute, route);
        }, []),
    );

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                navigation.goBack();
                return true;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress,
            );

            return () => subscription.remove();
        }, []),
    );
};
