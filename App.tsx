// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;

// -----------------------------------------------------------------------------

// import 'react-native-gesture-handler';
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { StatusBar, useColorScheme } from 'react-native';
// import BottomTabs from './src/navigation/BottomTabs';

// export default function App() {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <NavigationContainer>
//         <BottomTabs />
//       </NavigationContainer>
//     </SafeAreaProvider>
//   );
// }

// -----------------------------------------------------------------------------

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, useColorScheme } from 'react-native';
import BottomTabs from './src/navigation/BottomTabs';

const AppTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: '#111111',
    card: '#111111',
    text: '#FFFFFF',
    border: '#111111',
    primary: '#FFFFFF',
  },
};

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'}/>
      <NavigationContainer theme={AppTheme}>
        <BottomTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}