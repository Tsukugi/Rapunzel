import { useState, useEffect, FC } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { PaperSelect } from "react-native-paper-select";

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
    list: string[];
    onSelect: (newValue: string) => void;
}
export const RapunzelSelect: FC<RapunzelSelectProps> = ({
    label,
    list,
    onSelect,
}) => {
    const { colors } = useTheme();

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
            const firstItem: SelectItem = { _id: `0`, value: list[0] };
            setStateValues({
                ...stateValues,
                value: firstItem.value,
                selectedList: [firstItem],
            });
        };

        getData();
        return () => {
            isMounted = false;
        };
    }, []);

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
            onSelection={(value: any) => {
                setStateValues({
                    ...stateValues,
                    value: value.text,
                    selectedList: value.selectedList,
                    error: "",
                });
                onSelect(value.text);
            }}
            arrayList={[...stateValues.list]}
            hideSearchBox={true}
            selectedArrayList={[...stateValues.selectedList]}
            errorText={stateValues.error}
            multiEnable={false}
        />
    );
};
