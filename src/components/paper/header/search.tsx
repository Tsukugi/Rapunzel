import { Appbar, Searchbar } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { RapunzelLog } from "../../../config/log";
import { useFocusEffect } from "@react-navigation/native";
import { useRapunzelStore } from "../../../store/store";
import { ViewNames } from "../../navigators/interfaces";

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
    const {
        header: [header, headerEffect],
    } = useRapunzelStore();

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
        }, []),
    );

    const onChangeHandler = (text: string) => {
        setSearchQuery(text);
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
        flex: 1,
        minWidth: 0,
    },
    Searchbar: {
        flex: 1,
        minWidth: 0,
        height: 45,
    },
});

export default PaperSearch;
