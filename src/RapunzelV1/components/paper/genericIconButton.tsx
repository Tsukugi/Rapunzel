import * as React from "react";
import { IconButton } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

interface GenericIconButtonProps {
    icon: IconSource;
    onPress: (ev: any) => void;
}

const GenericIconButton = ({ icon, onPress }: GenericIconButtonProps) => (
    <IconButton
        icon={icon}
        size={20}
        onPress={onPress}
    />
);

export default GenericIconButton;
