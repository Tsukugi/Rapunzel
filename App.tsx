import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme';
import { initRapunzelStore, useRapunzelStore } from './src/store';
import { RapunzelStorage } from './src/storage/rapunzelStorage';
import { onAppStart } from './src/lifecycle/onAppStart';

initRapunzelStore();

const RapunzelApp = () => {
  useEffect(onAppStart, []);

  const {
    ui: [ui, useUIEffect],
    config: [, useConfigEffect],
  } = useRapunzelStore();
  const { colors } = useTheme();

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

  useConfigEffect((nextConfig) => {
    // Persist config updates (repository, headers, cache prefs) for the next launch.
    RapunzelStorage.saveConfig(nextConfig);
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
        {isSnackVisible ? (
          <View style={[styles.snackbar, { backgroundColor: colors.black }]}>
            <Text style={[styles.snackText, { color: colors.white }]}>{snackMessage}</Text>
          </View>
        ) : null}
        <ExpoStatusBar style="auto" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <RapunzelApp />
    </ThemeProvider>
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
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  snackText: {
    color: '#fff',
    textAlign: 'center',
  },
});
