import { Appbar, Searchbar } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useCallback, useState } from "react";
import { RapunzelLog } from "../../../config/log";
import { useFocusEffect } from "@react-navigation/native";
import { getRapunzelStore } from "../../../store/store";

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
    onValueChange = () => undefined,
    onSubmit = () => undefined,
    onClose = () => undefined,
}: PaperSearchProps) => {
    const {
        header: [header, headerEffect],
    } = getRapunzelStore();

    const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(
        !!header.searchValue,
    );
    const [searchQuery, setSearchQuery] = useState(header.searchValue);

    headerEffect(({ searchValue }) => {
        setSearchQuery(searchValue);
        RapunzelLog.log({ searchValue });
    });
    useFocusEffect(
        useCallback(() => {
            setSearchQuery(header.searchValue);
            RapunzelLog.log({ header });
        }, [header]),
    );

    const onChangeHandler = (text: string) => {
        setSearchQuery(text);
        onValueChange(text);
    };

    const onSubmitHandler = () => {
        onSubmit(searchQuery);
    };

    const onCloseHandler = () => {
        onClose();
        header.searchValue = "";
        setSearchQuery("");
        setIsSearchExpanded(false);
    };

    return isSearchExpanded ? (
        <View style={styles.searchContainer}>
            <Searchbar
                placeholder={placeholder}
                style={styles.Searchbar}
                inputStyle={{
                    minHeight: 0,
                    paddingVertical: 0,
                    textAlignVertical: "center",
                }}
                traileringIcon="close"
                onSubmitEditing={onSubmitHandler}
                onTraileringIconPress={onCloseHandler}
                onChangeText={onChangeHandler}
                loading={isLoading}
                value={searchQuery}
                defaultValue={defaultValue}
            />
        </View>
    ) : (
        <Appbar.Action
            icon="magnify"
            onPress={() => {
                setIsSearchExpanded(true);
            }}
        />
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        alignSelf: "stretch",
        flex: 1,
        minWidth: 0,
        justifyContent: "center",
    },
    Searchbar: {
        flexGrow: 0,
        flexShrink: 1,
        height: 48,
        width: "100%",
    },
});

export default PaperSearch;
