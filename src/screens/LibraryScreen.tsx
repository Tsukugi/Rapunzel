import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';
import { ViewNames } from '../store/types';

const LibraryScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{ViewNames.RapunzelLibrary}</Text>
      <Text style={styles.subtitle}>Library placeholder</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
  },
});

export default LibraryScreen;
