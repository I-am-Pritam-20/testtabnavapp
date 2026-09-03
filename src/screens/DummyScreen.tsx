import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function DummyScreen({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export const HomeScreen = () => <DummyScreen label="Home" />;
export const SearchScreen = () => <DummyScreen label="Search" />;
export const AccountScreen = () => <DummyScreen label="Account" />;
export const SettingsScreen = () => <DummyScreen label="Settings" />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});