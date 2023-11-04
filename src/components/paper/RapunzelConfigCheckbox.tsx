import React, { FC } from "react";
import { Checkbox } from "react-native-paper";
import { RapunzelConfigBase } from "../../config/interfaces";
import { useRapunzelStore } from "../../store/store";

interface RapunzelCheckboxItemProps {
    label: string;
    configId: keyof RapunzelConfigBase;
}

const RapunzelConfigCheckbox: FC<RapunzelCheckboxItemProps> = ({
    label,
    configId,
}) => {
    const {
        config: [config],
    } = useRapunzelStore();

    const [localChecked, setLocalChecked] = React.useState<boolean>(
        config[configId],
    );

    const getStatus = (checkedMatch: boolean) =>
        checkedMatch ? "checked" : "unchecked";

    const onCheckedHandler = () => {
        if (typeof config[configId] !== "boolean")
            throw "[onCheckedHandler] Cannot assign value to a non boolean property";

        const newState: boolean = !config[configId];

        setLocalChecked(newState);
        config[configId] = !config[configId];
    };

    return (
        <Checkbox.Item
            label={label}
            status={getStatus(localChecked)}
            onPress={onCheckedHandler}
        />
    );
};

export default RapunzelConfigCheckbox;
