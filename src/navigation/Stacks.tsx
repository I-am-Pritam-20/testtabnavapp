import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  SearchScreen,
  AccountScreen,
  SettingsScreen,
} from '../screens/DummyScreen';

const HomeStackNav = createNativeStackNavigator();
const SearchStackNav = createNativeStackNavigator();
const AccountStackNav = createNativeStackNavigator();
const SettingsStackNav = createNativeStackNavigator();

const screenOptions = { headerShown: false } as const;

export function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={screenOptions}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
    </HomeStackNav.Navigator>
  );
}

export function SearchStack() {
  return (
    <SearchStackNav.Navigator screenOptions={screenOptions}>
      <SearchStackNav.Screen name="SearchMain" component={SearchScreen} />
    </SearchStackNav.Navigator>
  );
}

export function AccountStack() {
  return (
    <AccountStackNav.Navigator screenOptions={screenOptions}>
      <AccountStackNav.Screen name="AccountMain" component={AccountScreen} />
    </AccountStackNav.Navigator>
  );
}

export function SettingsStack() {
  return (
    <SettingsStackNav.Navigator screenOptions={screenOptions}>
      <SettingsStackNav.Screen name="SettingsMain" component={SettingsScreen} />
    </SettingsStackNav.Navigator>
  );
}