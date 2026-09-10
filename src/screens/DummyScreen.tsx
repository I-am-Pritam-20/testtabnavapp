import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function DummyScreen({ label, bgColor }: { label: string , bgColor: string}) {
  return (
    <View style={[styles.container, {backgroundColor: bgColor}]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export const HomeScreen = () => <DummyScreen label="Home" bgColor='#111111'/>;
export const SearchScreen = () => <DummyScreen label="Search" bgColor='#111111'/>;
export const AccountScreen = () => <DummyScreen label="Account" bgColor='#111111'/>;
export const SettingsScreen = () => <DummyScreen label="Settings" bgColor='#111111'/>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#2c3fbb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});