import React, { useState } from "react";
import { DeviceCache } from "../../cache/cache";
import { Button, Card, List, Text } from "react-native-paper";
import { Export } from "../../cache/Export";
import { useRapunzelStore } from "../../store/store";

const CacheScreen = () => {
    const {
        library: [library],
    } = useRapunzelStore();

    const [size, setSize] = useState(0);
    const onCalculateSizeHandler = () => {
        DeviceCache.calculateCacheSize().then((value) => setSize(value));
    };
    const onExportHandler = () => {
        Export.exportLibraryAsJson();
    };
    const onImportHandler = () => {
        Export.importLibraryFromJson();
    };
    return (
        <Card>
            <Card.Content>
                <List.Section>
                    <Text>Cache size: {size.toFixed(2)}MB</Text>
                </List.Section>
                <List.Section>
                    <Button mode="outlined" onPress={onCalculateSizeHandler}>
                        Calculate Cache Size
                    </Button>
                </List.Section>
                <List.Section>
                    <Text>
                        Library size: {Object.keys(library.saved).length} titles
                    </Text>
                </List.Section>
                <List.Section>
                    <Button mode="outlined" onPress={onImportHandler}>
                        Import as JSON
                    </Button>
                </List.Section>
                <List.Section>
                    <Button mode="outlined" onPress={onExportHandler}>
                        Export as JSON
                    </Button>
                </List.Section>
                <List.Section>
                    <Button mode="outlined" onPress={DeviceCache.clearCache}>
                        Clear Image Storage
                    </Button>
                </List.Section>
            </Card.Content>
        </Card>
    );
};

export default CacheScreen;
