import { useState, FC } from "react";
import { StyleProp, TextStyle } from "react-native";
import { PaperSelect } from "react-native-paper-select";
import { LocalTheme } from "../../themes";
import {
    ListItem,
    SelectionCallback,
} from "react-native-paper-select/lib/typescript/interface/paperSelect.interface";

interface StateValues {
    value: string;
    list: ListItem[];
    selectedList: ListItem[];
    error: string;
}

export interface RapunzelSelectProps {
    label: string;
    initialValue: string[];
    list: string[];
    multi?: boolean;
    onSelect: (newValue: string[]) => void;
}
export const RapunzelSelect: FC<RapunzelSelectProps> = ({
    label,
    initialValue,
    list,
    multi = false,
    onSelect,
}) => {
    const { colors } = LocalTheme.useTheme();

    const toListItem = (list: string[]): ListItem[] =>
        list.map((item) => ({ _id: `id-${item}`, value: item }));

    const [stateValues, setStateValues] = useState<StateValues>({
        value: initialValue.join(", "),
        list: toListItem(list),
        selectedList: toListItem(initialValue),
        error: "",
    });

    const onSelectionHandler: SelectionCallback = (values) => {
        setStateValues({
            list: stateValues.list,
            value: values.text,
            selectedList: values.selectedList,
            error: "",
        });
        onSelect(values.selectedList.map((item) => item.value));
    };

    const style: StyleProp<TextStyle> = {
        backgroundColor: colors.background,
        color: colors.onBackground,
        borderColor: colors.onPrimary,
    };

    return (
        <PaperSelect
            checkboxProps={{
                checkboxColor: colors.primary,
                checkboxUncheckedColor: colors.onPrimary,
                checkboxLabelStyle: style,
            }}
            dialogStyle={style}
            textInputStyle={style}
            hideSearchBox={true}
            onSelection={onSelectionHandler}
            label={label}
            value={stateValues.value}
            arrayList={stateValues.list}
            selectedArrayList={stateValues.selectedList}
            errorText={stateValues.error}
            multiEnable={multi}
        />
    );
};
