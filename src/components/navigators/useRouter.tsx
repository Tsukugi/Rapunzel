import React from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { UsesNavigation, ViewNames } from "./interfaces";
import { useRapunzelStore } from "../../store/store";
import { useRapunzelStorage } from "../../cache/storage";
import { StorageEntries } from "../../cache/interfaces";
import { RapunzelLog } from "../../config/log";

interface UseRouterProps {
    route: ViewNames;
}

const HomeRoute = ViewNames.RapunzelBrowse;

export const useRouter = ({ route }: UseRouterProps) => {
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
};

const removeLastElement = <T,>(arr: T[]): T[] => {
    if (arr.length === 0) {
        return arr; // Return the original array if it's empty
    }
    return arr.slice(0, -1); // Use slice to create a new array without the last element
};

export const useRapunzelNavigation = () => {
    const navigation = useNavigation();
    const {
        router: [router],
    } = useRapunzelStore();
    return {
        goBack: () => {
            router.history = removeLastElement(router.history);
            const lastRoute =
                router.history[router.history.length - 1] || HomeRoute;
            navigation.navigate(lastRoute as never);
        },
        redirect: (to: ViewNames) => {
            navigation.navigate(to as never);
        },
    };
};
