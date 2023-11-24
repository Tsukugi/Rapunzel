import { useState, useEffect, FC } from "react";
import { StyleProp, TextStyle } from "react-native";
import { PaperSelect } from "react-native-paper-select";
import { LocalTheme } from "../../themes";
import { SelectionCallback } from "react-native-paper-select/lib/typescript/interface/paperSelect.interface";

interface SelectItem {
    _id: string;
    value: string;
}

interface StateValues {
    value: string;
    list: SelectItem[];
    selectedList: SelectItem[];
    error: string;
}

export interface RapunzelSelectProps {
    label: string;
    initialValue: string[];
    list: string[];
    onSelect: (newValue: string[]) => void;
}
export const RapunzelSelect: FC<RapunzelSelectProps> = ({
    label,
    initialValue,
    list,
    onSelect,
}) => {
    const { colors } = LocalTheme.useTheme();

    const [stateValues, setStateValues] = useState<StateValues>({
        value: "",
        list: list.map((item, index) => ({ _id: `${index}`, value: item })),
        selectedList: [],
        error: "",
    });

    useEffect(() => {
        let isMounted = true;
        let getData = async () => {
            if (!isMounted) return;

            const initialItems: SelectItem[] = list
                .filter((item) => initialValue.includes(item))
                .map((item, index) => ({
                    _id: `${index}`,
                    value: item,
                }));

            setStateValues({
                ...stateValues,
                value: initialItems.map((item) => item.value).join(", "),
                selectedList: initialItems,
            });
        };

        getData();
        return () => {
            isMounted = false;
        };
    }, []);

    const onSelectionHandler: SelectionCallback = (values) => {
        setStateValues({
            ...stateValues,
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
            label={label}
            value={stateValues.value}
            onSelection={onSelectionHandler}
            arrayList={[...stateValues.list]}
            hideSearchBox={true}
            selectedArrayList={[...stateValues.selectedList]}
            errorText={stateValues.error}
            multiEnable={true}
        />
    );
};
