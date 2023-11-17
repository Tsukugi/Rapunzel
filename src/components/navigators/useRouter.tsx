import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ViewNames } from "./interfaces";
import { useRapunzelStore } from "../../store/store";
import { useRapunzelStorage } from "../../cache/storage";
import { StorageEntries } from "../../cache/interfaces";

interface UseRouterProps {
    route: ViewNames;
}

export const useRouter = ({ route }: UseRouterProps) => {
    const {
        router: [router],
    } = useRapunzelStore();

    useFocusEffect(
        React.useCallback(() => {
            router.currentRoute = route;
            useRapunzelStorage().setItem(StorageEntries.currentRoute, route);
        }, []),
    );
};
