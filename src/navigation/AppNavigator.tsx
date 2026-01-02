import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform } from "react-native";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import AccountsScreen from "../screens/AccountsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import GoalsScreen from "../screens/GoalsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import { spacing } from "../theme/spacing";
import { fontSize, fontWeight } from "../theme/typography";

/**
 * Navigation param lists
 */
export type RootStackParamList = {
    MainTabs: undefined;
};

export type MainTabParamList = {
    DashboardTab: undefined;
    TransactionsTab: undefined;
    AccountsTab: undefined;
    BudgetsTab: undefined;
    GoalsTab: undefined;
    SettingsTab: undefined;
};

export type AccountsStackParamList = {
    Accounts: undefined;
    Transactions: { accountId: string };
};

export type TransactionsStackParamList = {
    TransactionsList: undefined;
    TransactionDetails: { transactionId: string };
};

export type GoalsStackParamList = {
    Goals: undefined;
};

export type SettingsStackParamList = {
    Settings: undefined;
};

/**
 * Create navigators
 */
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const DashboardStack = createNativeStackNavigator<{ Dashboard: undefined }>();
const AccountsStack = createNativeStackNavigator<AccountsStackParamList>();
const TransactionsStack =
    createNativeStackNavigator<TransactionsStackParamList>();
const GoalsStack = createNativeStackNavigator<GoalsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

/**
 * Tab icon component
 */
const TabIcon: React.FC<{
    name: keyof typeof MaterialCommunityIcons.glyphMap;
    focused: boolean;
    color: string;
}> = ({ name, focused, color }) => (
    <MaterialCommunityIcons
        name={name}
        size={24}
        color={color}
        style={{ opacity: focused ? 1 : 0.6 }}
    />
);

/**
 * Dashboard Stack Navigator
 */
const DashboardStackNavigator = () => {
    return (
        <DashboardStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <DashboardStack.Screen
                name="Dashboard"
                component={DashboardScreen}
            />
        </DashboardStack.Navigator>
    );
};

/**
 * Accounts Stack Navigator
 */
const AccountsStackNavigator = () => {
    const { colors } = useTheme();
    return (
        <AccountsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: fontWeight.semiBold,
                    fontSize: fontSize.lg,
                },
                headerShadowVisible: false,
            }}
        >
            <AccountsStack.Screen
                name="Accounts"
                component={AccountsScreen}
                options={{
                    title: "My Accounts",
                }}
            />
            <AccountsStack.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{
                    title: "Transactions",
                }}
            />
        </AccountsStack.Navigator>
    );
};

/**
 * Transactions Stack Navigator
 */
const TransactionsStackNavigator = () => {
    const { colors } = useTheme();
    return (
        <TransactionsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: fontWeight.semiBold,
                    fontSize: fontSize.lg,
                },
                headerShadowVisible: false,
            }}
        >
            <TransactionsStack.Screen
                name="TransactionsList"
                component={TransactionsScreen}
                options={{
                    title: "All Transactions",
                }}
            />
        </TransactionsStack.Navigator>
    );
};

/**
 * Goals Stack Navigator
 */
const GoalsStackNavigator = () => {
    const { colors } = useTheme();
    return (
        <GoalsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: fontWeight.semiBold,
                    fontSize: fontSize.lg,
                },
                headerShadowVisible: false,
            }}
        >
            <GoalsStack.Screen
                name="Goals"
                component={GoalsScreen}
                options={{
                    title: "Savings Goals",
                }}
            />
        </GoalsStack.Navigator>
    );
};

/**
 * Settings Stack Navigator
 */
const SettingsStackNavigator = () => {
    const { colors } = useTheme();
    return (
        <SettingsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: fontWeight.semiBold,
                    fontSize: fontSize.lg,
                },
                headerShadowVisible: false,
            }}
        >
            <SettingsStack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: "Settings",
                }}
            />
        </SettingsStack.Navigator>
    );
};

/**
 * Main Tab Navigator
 */
const MainTabNavigator = () => {
    const { colors } = useTheme();
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingBottom:
                        Platform.OS === "ios" ? spacing.sm : spacing.xs,
                    paddingTop: spacing.xs,
                    height: Platform.OS === "ios" ? 85 : 65,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="DashboardTab"
                component={DashboardStackNavigator}
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name="view-grid"
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="TransactionsTab"
                component={TransactionsStackNavigator}
                options={{
                    title: "Transactions",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name="chart-bar"
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="AccountsTab"
                component={AccountsStackNavigator}
                options={{
                    title: "Accounts",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name="wallet"
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="BudgetsTab"
                component={GoalsStackNavigator}
                options={{
                    title: "Budgets",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name="timer-sand"
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="GoalsTab"
                component={GoalsStackNavigator}
                options={{
                    title: "Goals",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name="rocket"
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsStackNavigator}
                options={{
                    title: "Settings",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon name="cog" focused={focused} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

/**
 * Root Navigator
 */
const RootNavigator = () => {
    return (
        <RootStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
        </RootStack.Navigator>
    );
};

/**
 * App Navigator Component (without NavigationContainer for Expo compatibility)
 */
export const AppNavigator: React.FC = () => {
    return (
        <ThemeProvider>
            <RootNavigator />
        </ThemeProvider>
    );
};

export default AppNavigator;
