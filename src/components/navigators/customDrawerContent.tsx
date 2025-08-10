import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItemList,
} from "@react-navigation/drawer";
import { Image } from "react-native";
import { Avatar, Divider } from "react-native-paper";
import { useRapunzelStore } from "../../store/store";
import { LilithRepo } from "../../store/interfaces";
interface CustomDrawerContent extends DrawerContentComponentProps {}

const safeImage =
    "https://mangadex.org/covers/27c025f4-d9f7-4ff7-bb43-2c5cc816fbb1/dfa37bb8-a156-494d-ae7d-9536d290c384.jpg.512.jpg";
const unsafeImage = "https://i4.nhentai.net/galleries/2694657/3.jpg";

const CustomDrawerContent = ({
    state,
    navigation,
    descriptors,
}: CustomDrawerContent) => {
    const {
        config: [config],
    } = useRapunzelStore();

    const getImage = () => {
        return config.repository === LilithRepo.NHentai
            ? unsafeImage
            : safeImage;
    };

    return (
        <DrawerContentScrollView>
            <Image
                style={{
                    width: 400,
                    height: 200,
                }}
                source={{
                    uri: getImage(),
                }}
            />
            <Avatar.Image
                size={128}
                style={{
                    position: "absolute",
                    top: 50,
                    left: 10,

                    zIndex: 2,
                }}
                source={{
                    uri: getImage(),
                }}
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
