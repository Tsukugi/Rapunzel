import { ViewStyle } from "react-native";
import { RandomTools } from "./random";

const borderColors = ["red", "green", "blue", "yellow", "orange", "pink"];

export const useDebugBorders = <T>(debug: boolean): Partial<ViewStyle> => {
    return debug
        ? {
              borderWidth: 4,
              borderColor: RandomTools.getRandomElementFromArray(borderColors),
          }
        : {};
};
