import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';
import { initRapunzelStore, useRapunzelStore } from './src/store';
import { onAppStart } from './src/lifecycle/onAppStart';

initRapunzelStore();

export default function App() {
  useEffect(onAppStart, []);

  const {
    ui: [ui, useUIEffect],
  } = useRapunzelStore();

  const [snackMessage, setSnackMessage] = useState(ui.snackMessage);
  const [isSnackVisible, setIsSnackVisible] = useState(false);

  useUIEffect((nextUi) => {
    const visible = !!nextUi.snackMessage;
    setSnackMessage(nextUi.snackMessage);
    setIsSnackVisible(visible);
    if (visible) {
      setTimeout(() => setIsSnackVisible(false), 3000);
    }
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
        {isSnackVisible ? (
          <View style={styles.snackbar}>
            <Text style={styles.snackText}>{snackMessage}</Text>
          </View>
        ) : null}
        <ExpoStatusBar style="auto" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  snackbar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: colors.black,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  snackText: {
    color: colors.white,
    textAlign: 'center',
  },
});
