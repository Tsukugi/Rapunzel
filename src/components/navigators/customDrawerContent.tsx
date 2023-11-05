import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItemList,
} from "@react-navigation/drawer";
import { Image } from "react-native";
import { Divider } from "react-native-paper";
interface CustomDrawerContent extends DrawerContentComponentProps {}

const CustomDrawerContent = ({ ...props }: CustomDrawerContent) => {
    return (
        <DrawerContentScrollView>
            <Image
                style={{
                    width: 400,
                    height: 200,
                }}
                source={{
                    uri: "https://i7.nhentai.net/galleries/2694657/3.jpg",
                }}
            />
            <Divider />
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;
