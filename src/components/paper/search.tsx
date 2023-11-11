import { useEffect, useState } from "react";
import { Searchbar } from "react-native-paper";
import { HeaderState, useRapunzelStore } from "../../store/store";

interface PaperSearchProps {
    placeholder?: string;
    initialValue?: string;
    isLoading: boolean;
    onValueChange: (newValue: string) => void;
    onClose: () => void;
}

const PaperSearch = ({
    initialValue = "",
    placeholder = "Search",
    isLoading,
    onValueChange,
    onClose,
}: PaperSearchProps) => {
    const [searchQuery, setSearchQuery] = useState(initialValue);

    const {
        header: [, watchHeader, unwatchHeader],
    } = useRapunzelStore();

    useEffect(() => {
        const onWatchHeader = async ({ searchValue }: HeaderState) => {
            setSearchQuery(searchValue);
        };

        watchHeader(onWatchHeader);
        return () => {
            unwatchHeader(onWatchHeader);
        };
    }, []);
    const onChangeHandler = (text: string) => {
        setSearchQuery(text);
        onValueChange(text);
    };

    return (
        <Searchbar
            placeholder={placeholder}
            loading={isLoading}
            style={{
                width: 300,
                height: 45,
            }}
            inputStyle={{
                paddingTop: 0,
            }}
            traileringIcon="close"
            onTraileringIconPress={onClose}
            onChangeText={onChangeHandler}
            value={searchQuery}
        />
    );
};

export default PaperSearch;
