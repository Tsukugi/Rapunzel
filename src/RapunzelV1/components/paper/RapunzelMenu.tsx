import { Menu } from "react-native-paper";

export interface RapunzelMenuItemProps {
    onPress: () => void;
    title: React.ReactNode;
}
export interface RapunzelMenuProps {
    items: RapunzelMenuItemProps[];
    visible: boolean;
    anchor: JSX.Element | { x: number; y: number };

    onClose: () => void;
}
export const RapunzelMenu = ({
    items,
    visible,
    anchor,
    onClose,
}: RapunzelMenuProps) => {
    return (
        <Menu
            anchorPosition="bottom"
            visible={visible}
            onDismiss={onClose}
            anchor={anchor}
        >
            {items.map((item, key) => (
                <Menu.Item
                    key={key}
                    title={item.title}
                    onPress={item.onPress}
                ></Menu.Item>
            ))}
        </Menu>
    );
};
