import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import ErrorBoundary from "../components/ErrorBoundary";
import { ScreenHeader } from "../components/ScreenHeader";
import { CurrencyProvider } from "../context/CurrencyContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { AccountsScreen } from "../screens/AccountsScreen";
import { BudgetsScreen } from "../screens/BudgetsScreen";
import CategoryAnalyticsScreen from "../screens/CategoryAnalyticsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import { GoalsScreen } from "../screens/GoalsScreen";
import { ManageCategoriesScreen } from "../screens/ManageCategoriesScreen";
import MoreScreen from "../screens/MoreScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TransactionsScreen } from "../screens/TransactionsScreen";
import { fontWeight } from "../theme/typography";

/**
 * Navigation param lists
 */
export type RootStackParamList = {
    MainTabs: undefined;
};

export type MainTabParamList = {
    DashboardTab: undefined;
    TransactionsTab: undefined;
    AnalyticsTab: undefined;
    MoreTab: undefined;
};

export type AccountsStackParamList = {
    Accounts: undefined;
    Transactions: { accountId: string };
};

export type BudgetsStackParamList = {
    Budgets: undefined;
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
    ManageCategories: undefined;
};

export type MoreStackParamList = {
    MoreMenu: undefined;
    Accounts: undefined;
    Budgets: undefined;
    Goals: undefined;
    Settings: undefined;
    ManageCategories: undefined;
};

/**
 * Create navigators
 */
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const DashboardStack = createNativeStackNavigator<{ Dashboard: undefined }>();
const AnalyticsStack = createNativeStackNavigator<{ Analytics: undefined }>();
const TransactionsStack =
    createNativeStackNavigator<TransactionsStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

/**
 * Tab icon component with better styling
 */
const TabIcon: React.FC<{
    name: keyof typeof MaterialCommunityIcons.glyphMap;
    focused: boolean;
    color: string;
}> = ({ name, focused, color }) => {
    return (
        <View
            style={[
                styles.iconContainer,
                focused && {
                    backgroundColor: color + "15",
                    borderRadius: 12,
                },
            ]}
        >
            <MaterialCommunityIcons name={name} size={24} color={color} />
        </View>
    );
};

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
                options={{
                    header: () => (
                        <ScreenHeader
                            title="MoneyMate"
                            showLogo={true}
                            showNotification={true}
                            showThemeToggle={true}
                        />
                    ),
                    headerShown: true,
                }}
            />
        </DashboardStack.Navigator>
    );
};

/**
 * Analytics Stack Navigator
 */
const AnalyticsStackNavigator = () => {
    return (
        <AnalyticsStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <AnalyticsStack.Screen
                name="Analytics"
                component={CategoryAnalyticsScreen}
                options={{
                    header: () => (
                        <ScreenHeader
                            title="Analytics"
                            showLogo={false}
                            showNotification={true}
                            showThemeToggle={true}
                        />
                    ),
                    headerShown: true,
                }}
            />
        </AnalyticsStack.Navigator>
    );
};

/**
 * Transactions Stack Navigator
 */
const TransactionsStackNavigator = () => {
    return (
        <TransactionsStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <TransactionsStack.Screen
                name="TransactionsList"
                component={TransactionsScreen}
                options={{
                    header: () => (
                        <ScreenHeader
                            title="Transactions"
                            showLogo={false}
                            showNotification={true}
                            showThemeToggle={true}
                        />
                    ),
                    headerShown: true,
                }}
            />
        </TransactionsStack.Navigator>
    );
};

/**
 * More Stack Navigator (combines Accounts, Budgets, Goals, Settings)
 */
const MoreStackNavigator = () => {
    return (
        <MoreStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <MoreStack.Screen
                name="MoreMenu"
                component={MoreScreen}
                options={{
                    header: () => (
                        <ScreenHeader
                            title="More"
                            showLogo={false}
                            showNotification={true}
                            showThemeToggle={true}
                        />
                    ),
                    headerShown: true,
                }}
            />
            <MoreStack.Screen
                name="Accounts"
                component={AccountsScreen}
                options={{
                    header: () => (
                        <ScreenHeader
                            title="My Accounts"
                            showLogo={false}
                            showNotification={true}
                            showThemeToggle={true}
                        />
                    ),
                    headerShown: true,
                }}
            />
            <MoreStack.Screen
                name="Budgets"
                component={BudgetsScreen}
                options={{
                    header: () => (
                        <ScreenHeader
                            title="My Budgets"
                            showLogo={false}
                            showNotification={true}
                            showThemeToggle={true}
                        />
                    ),
                    headerShown: true,
                }}
            />
            <MoreStack.Screen
                name="Goals"
                component={GoalsScreen}
                options={{
                    header: () => (
                        <ScreenHeader
                            title="Savings Goals"
                            showLogo={false}
                            showNotification={true}
                            showThemeToggle={true}
                        />
                    ),
                    headerShown: true,
                }}
            />
            <MoreStack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    header: () => (
                        <ScreenHeader
                            title="Settings"
                            showLogo={false}
                            showNotification={true}
                            showThemeToggle={true}
                        />
                    ),
                    headerShown: true,
                }}
            />
            <MoreStack.Screen
                name="ManageCategories"
                component={ManageCategoriesScreen}
                options={{
                    header: () => (
                        <ScreenHeader
                            title="Categories"
                            showLogo={false}
                            showNotification={true}
                            showThemeToggle={true}
                        />
                    ),
                    headerShown: true,
                }}
            />
        </MoreStack.Navigator>
    );
};

/**
 * Main Tab Navigator - Redesigned with 4 tabs
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
                    borderTopWidth: 0,
                    paddingBottom: Platform.OS === "ios" ? 24 : 8,
                    paddingTop: 8,
                    height: Platform.OS === "ios" ? 88 : 65,
                    elevation: 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: fontWeight.semiBold,
                    marginTop: 4,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            <Tab.Screen
                name="DashboardTab"
                component={DashboardStackNavigator}
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name="home-variant"
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
                            name="swap-horizontal"
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="AnalyticsTab"
                component={AnalyticsStackNavigator}
                options={{
                    title: "Analytics",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon
                            name="chart-box"
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="MoreTab"
                component={MoreStackNavigator}
                options={{
                    title: "More",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon name="menu" focused={focused} color={color} />
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
 * App Navigator Component
 */
export const AppNavigator: React.FC = () => {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <CurrencyProvider>
                    <RootNavigator />
                </CurrencyProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default AppNavigator;
