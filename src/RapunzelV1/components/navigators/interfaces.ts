import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ParamListBase } from "@react-navigation/native";
import { ViewNameKeys, ViewNames } from "../../store/interfaces";

export interface UsesNavigation {
    navigation: DrawerNavigationProp<ParamListBase, string, undefined>;
}

export { ViewNames, ViewNameKeys };
