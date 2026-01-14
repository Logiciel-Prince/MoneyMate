import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { AddTransactionModal } from "../components/AddTransactionModal";
import { AnimatedCard } from "../components/AnimatedCard";
import { AnimatedFAB } from "../components/AnimatedFAB";
import CustomBarChart, {
    MonthlyData as MonthlyDataType,
} from "../components/CustomBarChart";
import ExpensePieChart from "../components/ExpensePieChart";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";
import { fontSize, fontWeight } from "../theme/typography";
import { Account } from "../types/Account";
import { CustomCategory, getAllDefaultCategories } from "../types/Category";
import { Goal } from "../types/Goal";
import { Transaction, TransactionType } from "../types/Transaction";
import { seedDataIfNeeded } from "../utils/seed";
import { storage } from "../utils/storage";

const STORAGE_KEYS = {
    ACCOUNTS: "accounts",
    TRANSACTIONS: "transactions",
    GOALS: "goals",
    CATEGORIES: "custom_categories",
};

interface CategoryExpense {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

const DashboardScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { formatCurrency } = useCurrency();
    const [totalBalance, setTotalBalance] = useState<number>(0);
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
    const [previousMonthIncome, setPreviousMonthIncome] = useState<number>(0);
    const [previousMonthExpense, setPreviousMonthExpense] = useState<number>(0);
    const [monthlyData, setMonthlyData] = useState<MonthlyDataType[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [pieChartDate, setPieChartDate] = useState<Date>(new Date());
    const [monthlyExpenseForPie, setMonthlyExpenseForPie] = useState<number>(0);
    const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>(
        []
    );
    const [topGoals, setTopGoals] = useState<Goal[]>([]);

    const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
        []
    );
    const [isTransactionModalVisible, setIsTransactionModalVisible] =
        useState(false);

    const processPieChartData = useCallback(() => {
        const month = pieChartDate.getMonth();
        const year = pieChartDate.getFullYear();

        const filteredTransactions = allTransactions.filter((t) => {
            const tDate = new Date(t.date);
            return (
                tDate.getMonth() === month &&
                tDate.getFullYear() === year &&
                t.type === TransactionType.DEBIT
            );
        });

        const totalExpense = filteredTransactions.reduce(
            (sum, t) => sum + t.amount,
            0
        );

        setMonthlyExpenseForPie(totalExpense);

        // Group by category
        const expensesByCategory: { [key: string]: number } = {};
        filteredTransactions.forEach((t) => {
            const category = t.category || "other_expense";
            expensesByCategory[category] =
                (expensesByCategory[category] || 0) + t.amount;
        });

        // Convert to array and sort
        const processedCategories: CategoryExpense[] = Object.entries(
            expensesByCategory
        )
            .map(([categoryId, amount]) => {
                const customCat = customCategories.find(
                    (c) => c.id === categoryId
                );
                const name = customCat
                    ? customCat.name
                    : categoryId.charAt(0).toUpperCase() +
                      categoryId.slice(1).replace(/_/g, " ");
                const color =
                    customCat && customCat.color ? customCat.color : "#9CA3AF";

                return {
                    category: name,
                    amount,
                    percentage: (amount / totalExpense) * 100,
                    color: color,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        setCategoryExpenses(processedCategories);
    }, [allTransactions, pieChartDate, customCategories]);

    useEffect(() => {
        processPieChartData();
    }, [processPieChartData]);

    const handlePrevPieMonth = () => {
        setPieChartDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextPieMonth = () => {
        setPieChartDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
        });
    };

    // Calculate account balance from transactions
    const calculateAccountBalance = (
        account: Account,
        transactions: Transaction[]
    ): number => {
        const accountTransactions = transactions.filter(
            (t) => t.accountId === account.id
        );

        // Start with initial balance (account.balance)
        return accountTransactions.reduce((balance, transaction) => {
            if (transaction.type === TransactionType.CREDIT) {
                return balance + transaction.amount;
            } else {
                return balance - transaction.amount;
            }
        }, account.balance);
    };

    const loadData = useCallback(async () => {
        try {
            // Seed demo data if storage is empty
            await seedDataIfNeeded();

            const [
                loadedAccounts,
                loadedTransactions,
                loadedGoals,
                loadedCategories,
            ] = await Promise.all([
                storage.getData<Account[]>(STORAGE_KEYS.ACCOUNTS),
                storage.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS),
                storage.getData<Goal[]>(STORAGE_KEYS.GOALS),
                storage.getData<CustomCategory[]>(STORAGE_KEYS.CATEGORIES),
            ]);

            const accounts = loadedAccounts || [];
            const transactions = loadedTransactions || [];
            const goals = loadedGoals || [];

            // Set categories (with default fallback)
            if (loadedCategories && loadedCategories.length > 0) {
                setCustomCategories(loadedCategories);
            } else {
                setCustomCategories(getAllDefaultCategories());
            }

            setAllTransactions(transactions);

            // Calculate total balance from transactions
            const totalBalanceCalculated = accounts.reduce(
                (sum: number, acc: Account) =>
                    sum + calculateAccountBalance(acc, transactions),
                0
            );
            setTotalBalance(totalBalanceCalculated);

            // Calculate monthly income and expense (Current Month for Summary Cards)
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
            const monthlyChartData: MonthlyDataType[] = [];
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

            // Find the index of the first month with any data
            const firstWithDataIndex = monthlyChartData.findIndex(
                (data) => data.income > 0 || data.expense > 0
            );

            // If no data found in last 6 months, show at least the current month (last item)
            // If data found, slice from that month to the end (max 6)
            const filteredChartData =
                firstWithDataIndex === -1
                    ? [monthlyChartData[monthlyChartData.length - 1]]
                    : monthlyChartData.slice(firstWithDataIndex);

            setMonthlyData(filteredChartData);
            setTopGoals(goals.slice(0, 3));
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
    }, []);

    useEffect(() => {
        const initializeData = async () => {
            await seedDataIfNeeded();
            await loadData();
        };
        initializeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    useFocusEffect(
        useCallback(() => {
            loadData();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []) // Reload data when screen comes into focus
    );

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

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 120,
                    paddingHorizontal: spacing.lg,
                }}
            >
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
                </View>

                {/* Total Balance Card */}
                <AnimatedCard
                    delay={100}
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
                </AnimatedCard>

                {/* Income & Expense Row */}
                <View style={styles.statsRow}>
                    <AnimatedCard
                        delay={200}
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
                    </AnimatedCard>

                    <AnimatedCard
                        delay={300}
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
                    </AnimatedCard>
                </View>

                {/* Custom Analytics Chart (6 Months) */}
                <CustomBarChart data={monthlyData} title="Analytics" />

                {/* Expense Breakdown */}
                {/* Expense Breakdown */}
                {categoryExpenses.length > 0 && (
                    <ExpensePieChart
                        data={categoryExpenses}
                        totalExpense={monthlyExpenseForPie}
                        monthName={pieChartDate.toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                        })}
                        onPrevMonth={handlePrevPieMonth}
                        onNextMonth={handleNextPieMonth}
                    />
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
            <AnimatedFAB
                onPress={() => setIsTransactionModalVisible(true)}
                backgroundColor={colors.primary}
                delay={500}
                style={styles.fabPosition}
            />

            {/* Add Transaction Modal */}
            <AddTransactionModal
                visible={isTransactionModalVisible}
                onClose={() => setIsTransactionModalVisible(false)}
                onSave={async (transaction: Transaction) => {
                    try {
                        const existingTransactions =
                            (await storage.getData<Transaction[]>(
                                STORAGE_KEYS.TRANSACTIONS
                            )) || [];
                        const updatedTransactions = [
                            transaction,
                            ...existingTransactions,
                        ];
                        await storage.saveData(
                            STORAGE_KEYS.TRANSACTIONS,
                            updatedTransactions
                        );
                        setIsTransactionModalVisible(false);
                        loadData(); // Reload data to reflect the new transaction
                    } catch (error) {
                        console.error("Error saving transaction:", error);
                    }
                }}
            />
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
        paddingTop: spacing.xl,
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
    fabPosition: {
        position: "absolute",
        right: spacing.lg,
        bottom: spacing.xl,
    },
});

export default DashboardScreen;
