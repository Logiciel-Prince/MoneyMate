import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform, Text } from "react-native";
import AccountsScreen from "../screens/AccountsScreen";
import GoalsScreen from "../screens/GoalsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import { lightColors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSize, fontWeight } from "../theme/typography";

/**
 * Navigation param lists
 */
export type RootStackParamList = {
    MainTabs: undefined;
};

export type MainTabParamList = {
    AccountsTab: undefined;
    TransactionsTab: undefined;
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
const AccountsStack = createNativeStackNavigator<AccountsStackParamList>();
const TransactionsStack =
    createNativeStackNavigator<TransactionsStackParamList>();
const GoalsStack = createNativeStackNavigator<GoalsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

/**
 * Tab icon component
 */
const TabIcon: React.FC<{ icon: string; focused: boolean }> = ({
    icon,
    focused,
}) => (
    <Text
        style={{
            fontSize: 24,
            opacity: focused ? 1 : 0.6,
        }}
    >
        {icon}
    </Text>
);

/**
 * Accounts Stack Navigator
 */
const AccountsStackNavigator = () => {
    return (
        <AccountsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: lightColors.surface,
                },
                headerTintColor: lightColors.text,
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
    return (
        <TransactionsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: lightColors.surface,
                },
                headerTintColor: lightColors.text,
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
    return (
        <GoalsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: lightColors.surface,
                },
                headerTintColor: lightColors.text,
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
    return (
        <SettingsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: lightColors.surface,
                },
                headerTintColor: lightColors.text,
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
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: lightColors.surface,
                    borderTopColor: lightColors.border,
                    borderTopWidth: 1,
                    paddingBottom:
                        Platform.OS === "ios" ? spacing.sm : spacing.xs,
                    paddingTop: spacing.xs,
                    height: Platform.OS === "ios" ? 85 : 65,
                },
                tabBarActiveTintColor: lightColors.primary,
                tabBarInactiveTintColor: lightColors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="AccountsTab"
                component={AccountsStackNavigator}
                options={{
                    title: "Accounts",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="💳" focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="TransactionsTab"
                component={TransactionsStackNavigator}
                options={{
                    title: "Transactions",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📊" focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="GoalsTab"
                component={GoalsStackNavigator}
                options={{
                    title: "Goals",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🎯" focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsStackNavigator}
                options={{
                    title: "Settings",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="⚙️" focused={focused} />
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
    return <RootNavigator />;
};

export default AppNavigator;
