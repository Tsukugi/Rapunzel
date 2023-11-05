import { useState } from "react";
import { Searchbar } from "react-native-paper";

interface PaperSearchProps {
    placeholder?: string;
    value: string;
    isLoading: boolean;
    onValueChange: (newValue: string) => void;
    onClose: () => void;
}

const PaperSearch = ({
    value,
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
            style={{ width: 300 }}
            traileringIcon="close"
            onTraileringIconPress={onClose}
            onChangeText={onChangeHandler}
            value={searchQuery}
        />
    );
};

export default PaperSearch;
