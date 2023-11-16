import { useState, useEffect, FC } from "react";
import { StyleProp, TextStyle } from "react-native";
import { PaperSelect } from "react-native-paper-select";
import { LocalTheme } from "../../themes";

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
    initialValue: string;
    list: string[];
    onSelect: (newValue: string) => void;
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

            const firstItem: SelectItem = (() => {
                const index =
                    list.findIndex((item) => item === initialValue) || 0;
                return { _id: `${index}`, value: list[index] };
            })();

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
