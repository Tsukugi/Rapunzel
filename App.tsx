import React, { PropsWithChildren, useEffect, useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Dimensions,
} from "react-native";
import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from "react-native/Libraries/NewAppScreen";
import { NHentai } from "./api/nhentai";

type SectionProps = PropsWithChildren<{
    title: string;
}>;

function Section({ children, title }: SectionProps): JSX.Element {
    const isDarkMode = useColorScheme() === "dark";
    return (
        <View style={styles.sectionContainer}>
            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: isDarkMode ? Colors.white : Colors.black,
                    },
                ]}
            >
                {title}
            </Text>
            <Text
                style={[
                    styles.sectionDescription,
                    {
                        color: isDarkMode ? Colors.light : Colors.dark,
                    },
                ]}
            >
                {children}
            </Text>
        </View>
    );
}

const App: React.FC = () => {
    const [imageUris, setImageUris] = useState([]);
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    useEffect(() => {
        NHentai.searchFirstMatch("azur lane atago").then(setImageUris);
        // NHentai.getRandomBookFirstChapter().then(setImageUris);
    }, []);

    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}
            >
                <Header />
                <View
                    style={{
                        backgroundColor: isDarkMode
                            ? Colors.black
                            : Colors.white,
                    }}
                >
                    <Section title="NHentai">
                        <View>
                            {imageUris.length > 0 ? (
                                imageUris.map((imageUri, index) => (
                                    <View style={styles.container} key={index}>
                                        {imageUris ? (
                                            // Display the image with full width and auto height
                                            <Image
                                                source={{ uri: imageUri }}
                                                style={styles.image}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            // Placeholder or loading indicator while the image is being fetched
                                            <View style={styles.placeholder} />
                                        )}
                                    </View>
                                ))
                            ) : (
                                <View style={styles.placeholder} />
                            )}
                        </View>
                    </Section>
                    <Section title="Step One">
                        Edit <Text style={styles.highlight}>App.tsx</Text> to
                        change this screen and then come back to see your edits.
                    </Section>
                    <Section title="See Your Changes">
                        <ReloadInstructions />
                    </Section>
                    <Section title="Debug">
                        <DebugInstructions />
                    </Section>
                    <Section title="Learn More">
                        Read the docs to discover what to do next:
                    </Section>
                    <LearnMoreLinks />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const { width, height } = Dimensions.get("screen");

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "600",
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: "400",
    },
    highlight: {
        fontWeight: "700",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        overflow: "scroll",
    },
    image: {
        width: width, // Set your image width
        height: height, // Set your image height
        alignSelf: "center",
    },
    placeholder: {
        width: width - 10,
        height: width,
        backgroundColor: "#222",
    },
});

export default App;
