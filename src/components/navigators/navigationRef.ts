import {
    ParamListBase,
    createNavigationContainerRef,
} from "@react-navigation/native";

const navigationRef = createNavigationContainerRef<ParamListBase>();

export const getNavigationRef = () =>
    navigationRef.isReady() ? navigationRef : null;

export const navigationContainerRef = navigationRef;
