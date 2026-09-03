import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomFloatingTabBar from '../components/CustomFloatingTabBar';
import { HomeStack, SearchStack, AccountStack, SettingsStack } from './Stacks';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomFloatingTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Account" component={AccountStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}