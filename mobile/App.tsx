import 'react-native-gesture-handler'; // Must be first import
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// ─────────────────────────────────────────────────────────────────────────────
// Inner component (reads theme for StatusBar style)
// ─────────────────────────────────────────────────────────────────────────────
function AppInner() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
      <Toast />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root app component
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
