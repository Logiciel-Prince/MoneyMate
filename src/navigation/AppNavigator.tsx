import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import { CurrencyProvider } from "../context/CurrencyContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import AccountsScreen from "../screens/AccountsScreen";
import BudgetsScreen from "../screens/BudgetsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import GoalsScreen from "../screens/GoalsScreen";
import { ManageCategoriesScreen } from "../screens/ManageCategoriesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import { spacing } from "../theme/spacing";
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
    AccountsTab: undefined;
    BudgetsTab: undefined;
    GoalsTab: undefined;
    SettingsTab: undefined;
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

/**
 * Create navigators
 */
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const DashboardStack = createNativeStackNavigator<{ Dashboard: undefined }>();
const AccountsStack = createNativeStackNavigator<AccountsStackParamList>();
const BudgetsStack = createNativeStackNavigator<BudgetsStackParamList>();
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
        size={26}
        color={color}
        style={{ opacity: focused ? 1 : 0.7 }}
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
 * Accounts Stack Navigator
 */
const AccountsStackNavigator = () => {
    return (
        <AccountsStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <AccountsStack.Screen
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
            <AccountsStack.Screen
                name="Transactions"
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
        </AccountsStack.Navigator>
    );
};

/**
 * Budgets Stack Navigator
 */
const BudgetsStackNavigator = () => {
    return (
        <BudgetsStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <BudgetsStack.Screen
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
        </BudgetsStack.Navigator>
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
                            title="All Transactions"
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
 * Goals Stack Navigator
 */
const GoalsStackNavigator = () => {
    return (
        <GoalsStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <GoalsStack.Screen
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
        </GoalsStack.Navigator>
    );
};

/**
 * Settings Stack Navigator
 */
const SettingsStackNavigator = () => {
    return (
        <SettingsStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <SettingsStack.Screen
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
            <SettingsStack.Screen
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
                        Platform.OS === "ios" ? spacing.md : spacing.sm,
                    paddingTop: spacing.sm,
                    height: Platform.OS === "ios" ? 88 : 70,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: fontWeight.semiBold,
                    marginTop: 4,
                    marginBottom: 2,
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
                component={BudgetsStackNavigator}
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
            <CurrencyProvider>
                <RootNavigator />
            </CurrencyProvider>
        </ThemeProvider>
    );
};

export default AppNavigator;
