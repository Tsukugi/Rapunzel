import React, { FC } from "react";
import { Checkbox } from "react-native-paper";
import { RapunzelConfigBase } from "../../config/interfaces";
import { getRapunzelStore } from "../../store/store";
import { StorageEntries } from "../../cache/interfaces";
import { getRapunzelStorage } from "../../cache/storage";

const getStatus = (checkedMatch: boolean) =>
    checkedMatch ? "checked" : "unchecked";

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
    } = getRapunzelStore();

    const [localChecked, setLocalChecked] = React.useState<boolean>(
        config[configId],
    );

    const onCheckedHandler = () => {
        if (typeof config[configId] !== "boolean")
            throw "[onCheckedHandler] Cannot assign value to a non boolean property";

        const newState = !config[configId];

        setLocalChecked(newState);
        config[configId] = newState;
        getRapunzelStorage().setItem(StorageEntries.config, config);
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
