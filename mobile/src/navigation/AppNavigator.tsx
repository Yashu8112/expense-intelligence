import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../theme/colors';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ExpensesScreen from '../screens/expenses/ExpensesScreen';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import ChatbotScreen from '../screens/chatbot/ChatbotScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Navigator type declarations
// ─────────────────────────────────────────────────────────────────────────────
export type AuthStackParams = {
  Login: undefined;
  Signup: undefined;
};

export type ExpenseStackParams = {
  ExpensesList: undefined;
  AddExpense: { expenseId?: string | number } | undefined;
};

export type TabParams = {
  Dashboard: undefined;
  ExpensesTab: undefined;
  AddExpenseTab: undefined;
  Reports: undefined;
  Chatbot: undefined;
};

export type RootStackParams = {
  Main: undefined;
  Auth: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const Tab = createBottomTabNavigator<TabParams>();
const ExpenseStack = createNativeStackNavigator<ExpenseStackParams>();
const RootStack = createNativeStackNavigator<RootStackParams>();

// ─────────────────────────────────────────────────────────────────────────────
// Expense stack (list + add/edit)
// ─────────────────────────────────────────────────────────────────────────────
function ExpensesStackNavigator() {
  const { colors } = useTheme();
  return (
    <ExpenseStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <ExpenseStack.Screen name="ExpensesList" component={ExpensesScreen} />
      <ExpenseStack.Screen name="AddExpense" component={AddExpenseScreen} />
    </ExpenseStack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main bottom-tab navigator
// ─────────────────────────────────────────────────────────────────────────────
// The Add tab renders nothing — its press is intercepted to push AddExpense.
function AddExpensePlaceholder() {
  return null;
}

function MainTabNavigator({ navigation }: any) {
  const { colors, isDark } = useTheme();
  // Keeps tab content above the Android gesture bar / iPhone home indicator
  // instead of sinking to the very bottom of the screen.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 4,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'ExpensesTab') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Reports') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Chatbot') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="ExpensesTab"
        component={ExpensesStackNavigator}
        options={{ tabBarLabel: 'Expenses' }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('ExpensesTab', { screen: 'ExpensesList' });
          },
        })}
      />
      <Tab.Screen
        name="AddExpenseTab"
        component={AddExpensePlaceholder}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.addButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </LinearGradient>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('ExpensesTab', { screen: 'AddExpense' });
          },
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ tabBarLabel: 'Reports' }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ tabBarLabel: 'FinBot' }}
      />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth stack
// ─────────────────────────────────────────────────────────────────────────────
function AuthNavigator() {
  const { colors } = useTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root navigator
// ─────────────────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { isAuthenticated, isLoading, initialize } = useAuth();
  const { isDark, colors } = useTheme();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) return null; // Splash screen handles this

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: COLORS.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: COLORS.danger,
        },
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Sized to stay fully inside the 58pt tab bar content area — no overflow.
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
