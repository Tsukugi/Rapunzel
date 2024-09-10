import React, { useState } from "react";
import { DeviceCache } from "../../cache/cache";
import { Button, Card, List, Text } from "react-native-paper";
import { Export } from "../../cache/Export";

const CacheScreen = () => {
    const [size, setSize] = useState(0);
    const onCalculateSizeHandler = () => {
        DeviceCache.calculateCacheSize().then((value) => setSize(value));
    };
    const onExportHandler = () => {
        Export.exportLibraryAsJson();
        Export.migrateCachedImages();
    };
    return (
        <Card>
            <Card.Content>
                <List.Section>
                    <Text>Cache size: {size.toFixed(2)}MB</Text>
                    <Button onPress={onExportHandler}>Export</Button>
                </List.Section>
            </Card.Content>
            <Card.Actions>
                <Button onPress={onCalculateSizeHandler}>
                    Calculate Cache Size
                </Button>
                <Button onPress={DeviceCache.clearCache}>Clear</Button>
            </Card.Actions>
        </Card>
    );
};

export default CacheScreen;
