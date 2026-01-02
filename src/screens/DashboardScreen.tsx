import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import CustomBarChart, { MonthlyData } from "../components/CustomBarChart";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";
import { fontSize, fontWeight } from "../theme/typography";
import { Account } from "../types/Account";
import { Goal } from "../types/Goal";
import { Transaction, TransactionType } from "../types/Transaction";
import { seedDataIfNeeded } from "../utils/seed";
import { storage } from "../utils/storage";

/**
 * Storage keys
 */
const STORAGE_KEYS = {
    ACCOUNTS: "accounts",
    TRANSACTIONS: "transactions",
    GOALS: "goals",
};

interface CategoryExpense {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

const DashboardScreen: React.FC = () => {
    const { colors, toggleTheme, isDark } = useTheme();
    const [totalBalance, setTotalBalance] = useState<number>(0);
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
    const [previousMonthIncome, setPreviousMonthIncome] = useState<number>(0);
    const [previousMonthExpense, setPreviousMonthExpense] = useState<number>(0);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>(
        []
    );
    const [topGoals, setTopGoals] = useState<Goal[]>([]);

    // Category colors mapping
    const categoryColors = useMemo<{ [key: string]: string }>(
        () => ({
            food: "#FF6B6B",
            groceries: "#FFA500",
            transport: "#4ECDC4",
            entertainment: "#A78BFA",
            bills: "#F472B6",
            shopping: "#60A5FA",
            healthcare: "#34D399",
            education: "#FBBF24",
            travel: "#818CF8",
            utilities: "#FB923C",
            rent: "#EF4444",
            other_expense: "#9CA3AF",
        }),
        []
    );

    const loadData = useCallback(async () => {
        try {
            const [loadedAccounts, loadedTransactions, loadedGoals] =
                await Promise.all([
                    storage.getData<Account[]>(STORAGE_KEYS.ACCOUNTS),
                    storage.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS),
                    storage.getData<Goal[]>(STORAGE_KEYS.GOALS),
                ]);

            const accounts = loadedAccounts || [];
            const transactions = loadedTransactions || [];
            const goals = loadedGoals || [];

            setTotalBalance(
                accounts.reduce(
                    (sum: number, acc: Account) => sum + acc.balance,
                    0
                )
            );

            // Calculate monthly income and expense
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const currentMonthTransactions = transactions.filter(
                (t: Transaction) => {
                    const tDate = new Date(t.date);
                    return (
                        tDate.getMonth() === currentMonth &&
                        tDate.getFullYear() === currentYear
                    );
                }
            );

            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const previousYear =
                currentMonth === 0 ? currentYear - 1 : currentYear;

            const previousMonthTransactions = transactions.filter(
                (t: Transaction) => {
                    const tDate = new Date(t.date);
                    return (
                        tDate.getMonth() === previousMonth &&
                        tDate.getFullYear() === previousYear
                    );
                }
            );

            const currentIncome = currentMonthTransactions
                .filter((t: Transaction) => t.type === TransactionType.CREDIT)
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            const currentExpense = currentMonthTransactions
                .filter((t: Transaction) => t.type === TransactionType.DEBIT)
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            const prevIncome = previousMonthTransactions
                .filter((t: Transaction) => t.type === TransactionType.CREDIT)
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            const prevExpense = previousMonthTransactions
                .filter((t: Transaction) => t.type === TransactionType.DEBIT)
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            setMonthlyIncome(currentIncome);
            setMonthlyExpense(currentExpense);
            setPreviousMonthIncome(prevIncome);
            setPreviousMonthExpense(prevExpense);

            // Prepare monthly data for chart (last 6 months)
            const monthlyChartData: MonthlyData[] = [];
            const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];

            for (let i = 5; i >= 0; i--) {
                const targetMonth = currentMonth - i;
                const targetYear = currentYear + Math.floor(targetMonth / 12);
                const normalizedMonth = ((targetMonth % 12) + 12) % 12;

                const monthTransactions = transactions.filter(
                    (t: Transaction) => {
                        const tDate = new Date(t.date);
                        return (
                            tDate.getMonth() === normalizedMonth &&
                            tDate.getFullYear() === targetYear
                        );
                    }
                );

                const income = monthTransactions
                    .filter(
                        (t: Transaction) => t.type === TransactionType.CREDIT
                    )
                    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

                const expense = monthTransactions
                    .filter(
                        (t: Transaction) => t.type === TransactionType.DEBIT
                    )
                    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

                monthlyChartData.push({
                    income,
                    expense,
                    month: monthNames[normalizedMonth],
                });
            }

            setMonthlyData(monthlyChartData);

            // Calculate category-wise expenses for current month
            const categoryMap: { [key: string]: number } = {};
            currentMonthTransactions
                .filter((t: Transaction) => t.type === TransactionType.DEBIT)
                .forEach((t: Transaction) => {
                    const cat = t.category;
                    categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
                });

            const totalExpense = Object.values(categoryMap).reduce(
                (sum: number, val: number) => sum + val,
                0
            );

            const categoryData: CategoryExpense[] = Object.entries(categoryMap)
                .map(([category, amount]) => ({
                    category: formatCategoryName(category),
                    amount,
                    percentage:
                        totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
                    color: categoryColors[category] || "#9CA3AF",
                }))
                .sort((a, b) => b.amount - a.amount);

            setCategoryExpenses(categoryData);
            setTopGoals(goals.slice(0, 3));
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
    }, [categoryColors]);

    useEffect(() => {
        const initializeData = async () => {
            await seedDataIfNeeded();
            await loadData();
        };
        initializeData();
    }, [loadData]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const formatCategoryName = (category: string): string => {
        return category
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const formatCurrency = (amount: number): string => {
        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const calculateTrend = (
        current: number,
        previous: number
    ): { percentage: number; isPositive: boolean } => {
        if (previous === 0) {
            return {
                percentage: current > 0 ? 100 : 0,
                isPositive: current > 0,
            };
        }
        const change = ((current - previous) / previous) * 100;
        return { percentage: Math.abs(change), isPositive: change >= 0 };
    };

    const incomeTrend = calculateTrend(monthlyIncome, previousMonthIncome);
    const expenseTrend = calculateTrend(monthlyExpense, previousMonthExpense);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text
                        style={[
                            styles.greeting,
                            { color: colors.textSecondary },
                        ]}
                    >
                        {getGreeting()}
                    </Text>
                    <Text style={[styles.username, { color: colors.text }]}>
                        Prince Kumar
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { backgroundColor: colors.surface },
                        ]}
                        onPress={toggleTheme}
                    >
                        <MaterialCommunityIcons
                            name={
                                isDark ? "white-balance-sunny" : "weather-night"
                            }
                            size={20}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="bell-outline"
                            size={20}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Total Balance Card */}
                <View
                    style={[
                        styles.balanceCard,
                        { backgroundColor: colors.primary },
                    ]}
                >
                    <View>
                        <Text style={styles.balanceLabel}>Total Balance</Text>
                        <Text style={styles.balanceAmount}>
                            {formatCurrency(totalBalance)}
                        </Text>
                    </View>
                    <View style={styles.walletIconContainer}>
                        <MaterialCommunityIcons
                            name="wallet-outline"
                            size={32}
                            color="rgba(255,255,255,0.8)"
                        />
                    </View>
                </View>

                {/* Income & Expense Row */}
                <View style={styles.statsRow}>
                    <View
                        style={[
                            styles.statCard,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <View
                            style={[
                                styles.statIcon,
                                { backgroundColor: colors.success + "20" },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="arrow-down-left"
                                size={20}
                                color={colors.success}
                            />
                        </View>
                        <Text
                            style={[
                                styles.statLabel,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Income
                        </Text>
                        <Text
                            style={[styles.statAmount, { color: colors.text }]}
                        >
                            {formatCurrency(monthlyIncome)}
                        </Text>
                        <Text
                            style={[
                                styles.trendText,
                                {
                                    color: incomeTrend.isPositive
                                        ? colors.success
                                        : colors.danger,
                                },
                            ]}
                        >
                            {incomeTrend.isPositive ? "↑" : "↓"}{" "}
                            {incomeTrend.percentage.toFixed(0)}%
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statCard,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <View
                            style={[
                                styles.statIcon,
                                { backgroundColor: colors.danger + "20" },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="arrow-up-right"
                                size={20}
                                color={colors.danger}
                            />
                        </View>
                        <Text
                            style={[
                                styles.statLabel,
                                { color: colors.textSecondary },
                            ]}
                        >
                            Expense
                        </Text>
                        <Text
                            style={[styles.statAmount, { color: colors.text }]}
                        >
                            {formatCurrency(monthlyExpense)}
                        </Text>
                        <Text
                            style={[
                                styles.trendText,
                                {
                                    color: expenseTrend.isPositive
                                        ? colors.danger
                                        : colors.success,
                                },
                            ]}
                        >
                            {expenseTrend.isPositive ? "↑" : "↓"}{" "}
                            {expenseTrend.percentage.toFixed(0)}%
                        </Text>
                    </View>
                </View>

                {/* Custom Analytics Chart (6 Months) */}
                <CustomBarChart data={monthlyData} title="Analytics" />

                {/* Expense Breakdown */}
                {categoryExpenses.length > 0 && (
                    <View
                        style={[
                            styles.sectionContainer,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <View style={styles.sectionHeader}>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { color: colors.text },
                                ]}
                            >
                                Breakdown
                            </Text>
                            <Text
                                style={[
                                    styles.sectionSubtitle,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Jan 2026
                            </Text>
                        </View>

                        <View style={styles.horizontalBarsContainer}>
                            {categoryExpenses.slice(0, 5).map((cat, index) => (
                                <View
                                    key={index}
                                    style={styles.horizontalBarItem}
                                >
                                    <View style={styles.barLabelContainer}>
                                        <View style={styles.barLabelLeft}>
                                            <View
                                                style={[
                                                    styles.categoryDot,
                                                    {
                                                        backgroundColor:
                                                            cat.color,
                                                    },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.barLabel,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {cat.category}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[
                                                styles.barValue,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {formatCurrency(cat.amount)}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.barTrack,
                                            {
                                                backgroundColor:
                                                    colors.background,
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.barFill,
                                                {
                                                    width: `${cat.percentage}%`,
                                                    backgroundColor: cat.color,
                                                },
                                            ]}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Top Savings Goals */}
                <View
                    style={[
                        styles.sectionContainer,
                        { backgroundColor: colors.surface },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: colors.text },
                            ]}
                        >
                            Goals
                        </Text>
                        <TouchableOpacity>
                            <Text
                                style={{
                                    color: colors.primary,
                                    fontSize: fontSize.sm,
                                }}
                            >
                                See All
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {topGoals.length > 0 ? (
                        topGoals.map((goal) => (
                            <View key={goal.id} style={styles.goalItem}>
                                <View style={styles.goalInfo}>
                                    <Text
                                        style={[
                                            styles.goalName,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {goal.name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.goalAmount,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        {formatCurrency(goal.savedAmount)} /{" "}
                                        {formatCurrency(goal.targetAmount)}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.goalProgress,
                                        { backgroundColor: colors.background },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.goalProgressBar,
                                            {
                                                width: `${
                                                    (goal.savedAmount /
                                                        goal.targetAmount) *
                                                    100
                                                }%`,
                                                backgroundColor: colors.success,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text
                            style={[
                                styles.noGoalsText,
                                { color: colors.textSecondary },
                            ]}
                        >
                            No savings goals yet.
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    greeting: {
        fontSize: fontSize.sm,
        marginBottom: 2,
    },
    username: {
        fontSize: 20,
        fontWeight: fontWeight.bold,
    },
    headerActions: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    balanceCard: {
        padding: spacing.xl,
        borderRadius: 24,
        marginBottom: spacing.lg,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    balanceLabel: {
        fontSize: fontSize.sm,
        color: "rgba(255,255,255,0.8)",
        marginBottom: spacing.xs,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: fontWeight.bold,
        color: "#FFF",
    },
    walletIconContainer: {
        padding: spacing.xs,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
    },
    statsRow: {
        flexDirection: "row",
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    statLabel: {
        fontSize: fontSize.xs,
        marginBottom: 4,
    },
    statAmount: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: 4,
    },
    trendText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
    sectionContainer: {
        padding: spacing.lg,
        borderRadius: 24,
        marginBottom: spacing.lg,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    sectionSubtitle: {
        fontSize: fontSize.sm,
    },
    horizontalBarsContainer: {
        gap: spacing.md,
    },
    horizontalBarItem: {
        marginBottom: spacing.sm,
    },
    barLabelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.xs,
    },
    barLabelLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.sm,
    },
    barLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    barValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },
    barTrack: {
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: 3,
    },
    goalItem: {
        marginBottom: spacing.md,
    },
    goalInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.xs,
    },
    goalName: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    goalAmount: {
        fontSize: fontSize.xs,
    },
    goalProgress: {
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
    },
    goalProgressBar: {
        height: "100%",
        borderRadius: 3,
    },
    noGoalsText: {
        fontSize: fontSize.sm,
        textAlign: "center",
        paddingVertical: spacing.md,
    },
    fab: {
        position: "absolute",
        right: spacing.lg,
        bottom: 90,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});

export default DashboardScreen;
