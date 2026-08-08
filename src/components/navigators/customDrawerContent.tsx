import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItemList,
} from "@react-navigation/drawer";
import { Image } from "react-native";
import { Avatar, Divider } from "react-native-paper";
import { getRapunzelStore } from "../../store/store";
import { getRepositoryMascot } from "./repositoryMascots";
type CustomDrawerContent = DrawerContentComponentProps;

const CustomDrawerContent = ({
    state,
    navigation,
    descriptors,
}: CustomDrawerContent) => {
    const {
        config: [config],
    } = getRapunzelStore();

    const mascot = getRepositoryMascot(config.repository);

    return (
        <DrawerContentScrollView>
            <Image
                style={{
                    width: 400,
                    height: 200,
                }}
                source={mascot}
            />
            <Avatar.Image
                size={128}
                style={{
                    position: "absolute",
                    top: 50,
                    left: 10,

                    zIndex: 2,
                }}
                source={mascot}
            />
            <Divider />
            <DrawerItemList
                state={state}
                navigation={navigation}
                descriptors={descriptors}
            />
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;
