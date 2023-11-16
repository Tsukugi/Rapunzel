import { Searchbar } from "react-native-paper";
import { Dimensions, StyleSheet } from "react-native";
import { useState } from "react";

interface PaperSearchProps {
    placeholder?: string;
    value?: string;
    isLoading: boolean;
    onValueChange: (newValue: string) => void;
    onClose: () => void;
}

const PaperSearch = ({
    value = "",
    placeholder = "Search",
    isLoading,
    onValueChange,
    onClose,
}: PaperSearchProps) => {
    const [searchQuery, setSearchQuery] = useState(value);

    const onChangeHandler = (text: string) => {
        setSearchQuery(text);
        onValueChange(text);
    };

    return (
        <Searchbar
            placeholder={placeholder}
            loading={isLoading}
            style={styles.Searchbar}
            inputStyle={{
                paddingTop: 0,
            }}
            traileringIcon="close"
            onTraileringIconPress={onClose}
            onChangeText={onChangeHandler}
            value={searchQuery}
            defaultValue={value}
        />
    );
};

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
    Searchbar: {
        minWidth: (width * 2) / 3,
        height: 45,
    },
});

export default PaperSearch;
