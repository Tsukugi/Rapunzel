import { Appbar, Searchbar } from "react-native-paper";
import { Dimensions, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { RapunzelLog } from "../../../config/log";

interface PaperSearchProps {
    defaultValue?: string;
    placeholder?: string;
    isLoading?: boolean;
    onValueChange?: (newValue: string) => void;
    onSubmit?: (newValue: string) => void;
    onClose?: () => void;
}

const PaperSearch = ({
    defaultValue = "",
    placeholder = "Search",
    isLoading = false,
    onValueChange = () => {},
    onSubmit = () => {},
    onClose = () => {},
}: PaperSearchProps) => {
    const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!defaultValue) return;
        setIsSearchExpanded(true);
        setSearchQuery(defaultValue);
        onSubmit(defaultValue);
    }, []);

    RapunzelLog.log(searchQuery, isSearchExpanded);

    const onChangeHandler = (text: string) => {
        setSearchQuery(text);
    };

    const onSubmitHandler = () => {
        onSubmit(searchQuery);
    };

    const onCloseHandler = () => {
        onClose();
        setIsSearchExpanded(false);
    };

    return isSearchExpanded ? (
        <Searchbar
            placeholder={placeholder}
            style={styles.Searchbar}
            inputStyle={{
                paddingTop: 0,
            }}
            traileringIcon="close"
            onSubmitEditing={onSubmitHandler}
            onTraileringIconPress={onCloseHandler}
            onChangeText={onChangeHandler}
            loading={isLoading}
            value={searchQuery}
            defaultValue={defaultValue}
        />
    ) : (
        <Appbar.Action
            icon="magnify"
            onPress={() => {
                setIsSearchExpanded(true);
            }}
        />
    );
};

const { width } = Dimensions.get("screen");
const styles = StyleSheet.create({
    Searchbar: {
        minWidth: (width + 80) / 2,
        height: 45,
    },
});

export default PaperSearch;
