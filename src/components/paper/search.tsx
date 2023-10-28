import * as React from "react";
import { Searchbar } from "react-native-paper";
interface PaperSearchProps {
    onClose: () => void;
}
const PaperSearch = ({ onClose }: PaperSearchProps) => {
    const [searchQuery, setSearchQuery] = React.useState("");

    const onChangeSearch = (query: React.SetStateAction<string>) =>
        setSearchQuery(query);

    return (
        <Searchbar
            style={{ width: 300 }}
            traileringIcon="close"
            onTraileringIconPress={onClose}
            placeholder="Search"
            onChangeText={onChangeSearch}
            value={searchQuery}
        />
    );
};

export default PaperSearch;
