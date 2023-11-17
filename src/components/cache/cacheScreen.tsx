import React, { useState } from "react";
import { DeviceCache } from "../../cache/cache";
import { Button, Card, Text } from "react-native-paper";

const CacheScreen = () => {
    const [size, setSize] = useState(0);
    const onCalculateSizeHandler = () => {
        DeviceCache.calculateCacheSize().then((value) => setSize(value));
    };
    return (
        <Card>
            <Card.Content>
                <Text>Cache size: {size.toFixed(2)}MB</Text>
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
