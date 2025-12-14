import { Appbar } from "react-native-paper";
import { HeaderLeftMode } from "../interfaces";

export interface LeftModeProps {
    leftMode?: HeaderLeftMode;
    onBack: () => void;
    openMenu: () => void;
}

const HeaderLeftBtn = ({ onBack, openMenu, leftMode }: LeftModeProps) => {
    switch (leftMode) {
        case HeaderLeftMode.back:
            return <Appbar.BackAction onPress={onBack} />;
        case HeaderLeftMode.menu:
            return <Appbar.Action icon="menu" onPress={openMenu} />;
        default:
            return <Appbar.Action icon="menu" onPress={openMenu} />;
    }
};

export default HeaderLeftBtn;
