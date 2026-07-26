import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    Appbar,
    Button,
    Dialog,
    Portal,
    RadioButton,
    Text,
} from "react-native-paper";

import { UsesNavigation } from "../navigators/interfaces";
import { RapunzelMenu } from "../paper/RapunzelMenu";
import { ReaderImageFit, ReaderMode } from "../../store/interfaces";

interface ReaderHeaderProps extends UsesNavigation {
    title: string;
    visible: boolean;
    saved: boolean;
    mode: ReaderMode;
    imageFit: ReaderImageFit;
    onToggleSaved: () => void;
    onModeChange: (mode: ReaderMode) => void;
    onImageFitChange: (imageFit: ReaderImageFit) => void;
}

const ReaderHeader = ({
    navigation,
    title,
    visible,
    saved,
    mode,
    imageFit,
    onToggleSaved,
    onModeChange,
    onImageFitChange,
}: ReaderHeaderProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (!visible) setIsMenuOpen(false);
    }, [visible]);

    const optionsButton = (
        <Appbar.Action
            accessibilityLabel="Reader options"
            icon="dots-vertical"
            onPress={() => setIsMenuOpen(true)}
        />
    );

    return (
        <>
            {visible ? (
                <View
                    pointerEvents="box-none"
                    style={styles.overlay}
                    testID="reader-header-overlay"
                >
                    <Appbar.Header elevated>
                        <Appbar.BackAction onPress={navigation.goBack} />
                        <Appbar.Content title={title || "Reader"} />
                        <RapunzelMenu
                            items={[
                                {
                                    title: saved ? "Unsave" : "Save",
                                    onPress: () => {
                                        setIsMenuOpen(false);
                                        onToggleSaved();
                                    },
                                },
                                {
                                    title: "Reader settings",
                                    onPress: () => {
                                        setIsMenuOpen(false);
                                        setIsSettingsOpen(true);
                                    },
                                },
                            ]}
                            anchor={optionsButton}
                            visible={isMenuOpen}
                            onClose={() => setIsMenuOpen(false)}
                        />
                    </Appbar.Header>
                </View>
            ) : null}

            <Portal>
                <Dialog
                    visible={isSettingsOpen}
                    onDismiss={() => setIsSettingsOpen(false)}
                >
                    <Dialog.Title>Reader settings</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="titleMedium">Page navigation</Text>
                        <RadioButton.Group
                            value={mode}
                            onValueChange={(value) =>
                                onModeChange(value as ReaderMode)
                            }
                        >
                            <RadioButton.Item
                                label="Scroll down"
                                value={ReaderMode.Scroll}
                            />
                            <RadioButton.Item
                                label="Single page"
                                value={ReaderMode.SinglePage}
                            />
                        </RadioButton.Group>

                        <Text variant="titleMedium">Image fit</Text>
                        <RadioButton.Group
                            value={imageFit}
                            onValueChange={(value) =>
                                onImageFitChange(value as ReaderImageFit)
                            }
                        >
                            <RadioButton.Item
                                label="Fit to width"
                                value={ReaderImageFit.Width}
                            />
                            <RadioButton.Item
                                label="Fit to height"
                                value={ReaderImageFit.Height}
                            />
                            <RadioButton.Item
                                label="Auto"
                                value={ReaderImageFit.Auto}
                            />
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setIsSettingsOpen(false)}>
                            Done
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        elevation: 10,
    },
});

export default ReaderHeader;
