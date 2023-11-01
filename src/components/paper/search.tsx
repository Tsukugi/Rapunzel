import { useState } from "react";
import { Searchbar } from "react-native-paper";

interface PaperSearchProps {
    placeholder?: string;
    value: string;
    onValueChange: (newValue: string) => void;
    onClose: () => void;
}

const PaperSearch = ({
    value,
    placeholder = "Search",
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
            style={{ width: 300 }}
            traileringIcon="close"
            onTraileringIconPress={onClose}
            placeholder={placeholder}
            onChangeText={onChangeHandler}
            value={searchQuery}
        />
    );
};

export default PaperSearch;
