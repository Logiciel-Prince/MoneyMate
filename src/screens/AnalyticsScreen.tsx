import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AnimatedCard } from '../components/AnimatedCard';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { fontSize, fontWeight } from '../theme/typography';
import { CustomCategory, getAllDefaultCategories } from '../types/Category';
import { Transaction, TransactionType } from '../types/Transaction';
import { storage } from '../utils/storage';

const STORAGE_KEYS = {
    TRANSACTIONS: 'transactions',
    CATEGORIES: 'custom_categories',
};

interface CategoryAnalytics {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    currentAmount: number;
    previousAmount: number;
    change: number;
    changePercentage: number;
    type: 'income' | 'expense';
}

interface PeriodData {
    label: string;
    income: number;
    expense: number;
}

type PeriodType = 'month' | 'quarter' | 'year';
type ComparisonType = 'previous' | 'yearAgo';

export const AnalyticsScreen: React.FC = () => {
    const { colors } = useTheme();
    const { formatCurrency } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [periodType, setPeriodType] = useState<PeriodType>('month');
    const [comparisonType, setComparisonType] = useState<ComparisonType>('previous');
    const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics[]>([]);
    const [currentPeriodData, setCurrentPeriodData] = useState<PeriodData | null>(null);
    const [previousPeriodData, setPreviousPeriodData] = useState<PeriodData | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [storedTransactions, storedCategories] = await Promise.all([
                storage.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS),
                storage.getData<CustomCategory[]>(STORAGE_KEYS.CATEGORIES),
            ]);

            const transactions = (storedTransactions || []).map((t) => ({
                ...t,
                date: new Date(t.date),
            }));

            const categories = storedCategories && storedCategories.length > 0
                ? storedCategories
                : getAllDefaultCategories();

            // Calculate period ranges
            const now = new Date();
            const { currentStart, currentEnd, previousStart, previousEnd } = getPeriodRanges(
                now,
                periodType,
                comparisonType
            );

            // Filter transactions for current and previous periods
            const currentTransactions = transactions.filter(
                (t) => t.date >= currentStart && t.date <= currentEnd
            );
            const previousTransactions = transactions.filter(
                (t) => t.date >= previousStart && t.date <= previousEnd
            );

            // Calculate period totals
            const currentIncome = currentTransactions
                .filter((t) => t.type === TransactionType.CREDIT)
                .reduce((sum, t) => sum + t.amount, 0);
            const currentExpense = currentTransactions
                .filter((t) => t.type === TransactionType.DEBIT)
                .reduce((sum, t) => sum + t.amount, 0);

            const previousIncome = previousTransactions
                .filter((t) => t.type === TransactionType.CREDIT)
                .reduce((sum, t) => sum + t.amount, 0);
            const previousExpense = previousTransactions
                .filter((t) => t.type === TransactionType.DEBIT)
                .reduce((sum, t) => sum + t.amount, 0);

            setCurrentPeriodData({
                label: getPeriodLabel(currentStart, currentEnd, periodType),
                income: currentIncome,
                expense: currentExpense,
            });

            setPreviousPeriodData({
                label: getPeriodLabel(previousStart, previousEnd, periodType),
                income: previousIncome,
                expense: previousExpense,
            });

            // Calculate category-wise analytics
            const analytics: CategoryAnalytics[] = [];

            categories.forEach((category) => {
                const isIncome = category.type === 'income';
                const transactionType = isIncome ? TransactionType.CREDIT : TransactionType.DEBIT;

                const currentAmount = currentTransactions
                    .filter((t) => t.category === category.id && t.type === transactionType)
                    .reduce((sum, t) => sum + t.amount, 0);

                const previousAmount = previousTransactions
                    .filter((t) => t.category === category.id && t.type === transactionType)
                    .reduce((sum, t) => sum + t.amount, 0);

                // Only include categories with transactions
                if (currentAmount > 0 || previousAmount > 0) {
                    const change = currentAmount - previousAmount;
                    const changePercentage = previousAmount > 0
                        ? (change / previousAmount) * 100
                        : currentAmount > 0
                        ? 100
                        : 0;

                    analytics.push({
                        categoryId: category.id,
                        categoryName: category.name,
                        categoryColor: category.color || '#6B7280',
                        currentAmount,
                        previousAmount,
                        change,
                        changePercentage,
                        type: category.type,
                    });
                }
            });

            // Sort by current amount (descending)
            analytics.sort((a, b) => b.currentAmount - a.currentAmount);

            setCategoryAnalytics(analytics);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setLoading(false);
        }
    }, [periodType, comparisonType]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const getPeriodRanges = (
        now: Date,
        period: PeriodType,
        comparison: ComparisonType
    ) => {
        const currentStart = new Date(now);
        const currentEnd = new Date(now);
        const previousStart = new Date(now);
        const previousEnd = new Date(now);

        if (period === 'month') {
            // Current month
            currentStart.setDate(1);
            currentStart.setHours(0, 0, 0, 0);
            currentEnd.setMonth(currentEnd.getMonth() + 1, 0);
            currentEnd.setHours(23, 59, 59, 999);

            if (comparison === 'previous') {
                // Previous month
                previousStart.setMonth(previousStart.getMonth() - 1, 1);
                previousStart.setHours(0, 0, 0, 0);
                previousEnd.setDate(0);
                previousEnd.setHours(23, 59, 59, 999);
            } else {
                // Same month last year
                previousStart.setFullYear(previousStart.getFullYear() - 1);
                previousStart.setDate(1);
                previousStart.setHours(0, 0, 0, 0);
                previousEnd.setFullYear(previousEnd.getFullYear() - 1);
                previousEnd.setMonth(previousEnd.getMonth() + 1, 0);
                previousEnd.setHours(23, 59, 59, 999);
            }
        } else if (period === 'quarter') {
            // Current quarter
            const currentQuarter = Math.floor(now.getMonth() / 3);
            currentStart.setMonth(currentQuarter * 3, 1);
            currentStart.setHours(0, 0, 0, 0);
            currentEnd.setMonth(currentQuarter * 3 + 3, 0);
            currentEnd.setHours(23, 59, 59, 999);

            if (comparison === 'previous') {
                // Previous quarter
                const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
                const prevYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
                previousStart.setFullYear(prevYear);
                previousStart.setMonth(prevQuarter * 3, 1);
                previousStart.setHours(0, 0, 0, 0);
                previousEnd.setFullYear(prevYear);
                previousEnd.setMonth(prevQuarter * 3 + 3, 0);
                previousEnd.setHours(23, 59, 59, 999);
            } else {
                // Same quarter last year
                previousStart.setFullYear(previousStart.getFullYear() - 1);
                previousStart.setMonth(currentQuarter * 3, 1);
                previousStart.setHours(0, 0, 0, 0);
                previousEnd.setFullYear(previousEnd.getFullYear() - 1);
                previousEnd.setMonth(currentQuarter * 3 + 3, 0);
                previousEnd.setHours(23, 59, 59, 999);
            }
        } else {
            // Current year
            currentStart.setMonth(0, 1);
            currentStart.setHours(0, 0, 0, 0);
            currentEnd.setMonth(11, 31);
            currentEnd.setHours(23, 59, 59, 999);

            // Previous year
            previousStart.setFullYear(previousStart.getFullYear() - 1);
            previousStart.setMonth(0, 1);
            previousStart.setHours(0, 0, 0, 0);
            previousEnd.setFullYear(previousEnd.getFullYear() - 1);
            previousEnd.setMonth(11, 31);
            previousEnd.setHours(23, 59, 59, 999);
        }

        return { currentStart, currentEnd, previousStart, previousEnd };
    };

    const getPeriodLabel = (start: Date, end: Date, period: PeriodType): string => {
        if (period === 'month') {
            return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (period === 'quarter') {
            const quarter = Math.floor(start.getMonth() / 3) + 1;
            return `Q${quarter} ${start.getFullYear()}`;
        } else {
            return start.getFullYear().toString();
        }
    };

    const renderPeriodSelector = () => (
        <View style={styles.selectorContainer}>
            <Text style={[styles.selectorLabel, { color: colors.text }]}>Period</Text>
            <View style={styles.selectorButtons}>
                {(['month', 'quarter', 'year'] as PeriodType[]).map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.selectorButton,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            periodType === type && {
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                            },
                        ]}
                        onPress={() => setPeriodType(type)}
                    >
                        <Text
                            style={[
                                styles.selectorButtonText,
                                { color: colors.textSecondary },
                                periodType === type && { color: '#FFF', fontWeight: fontWeight.bold },
                            ]}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderComparisonSelector = () => (
        <View style={styles.selectorContainer}>
            <Text style={[styles.selectorLabel, { color: colors.text }]}>Compare with</Text>
            <View style={styles.selectorButtons}>
                <TouchableOpacity
                    style={[
                        styles.selectorButton,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        comparisonType === 'previous' && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                        },
                    ]}
                    onPress={() => setComparisonType('previous')}
                >
                    <Text
                        style={[
                            styles.selectorButtonText,
                            { color: colors.textSecondary },
                            comparisonType === 'previous' && {
                                color: '#FFF',
                                fontWeight: fontWeight.bold,
                            },
                        ]}
                    >
                        Previous {periodType}
                    </Text>
                </TouchableOpacity>
                {periodType !== 'year' && (
                    <TouchableOpacity
                        style={[
                            styles.selectorButton,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            comparisonType === 'yearAgo' && {
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                            },
                        ]}
                        onPress={() => setComparisonType('yearAgo')}
                    >
                        <Text
                            style={[
                                styles.selectorButtonText,
                                { color: colors.textSecondary },
                                comparisonType === 'yearAgo' && {
                                    color: '#FFF',
                                    fontWeight: fontWeight.bold,
                                },
                            ]}
                        >
                            Year ago
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderOverviewCards = () => {
        if (!currentPeriodData || !previousPeriodData) return null;

        const incomeChange = currentPeriodData.income - previousPeriodData.income;
        const incomeChangePercentage =
            previousPeriodData.income > 0
                ? (incomeChange / previousPeriodData.income) * 100
                : currentPeriodData.income > 0
                ? 100
                : 0;

        const expenseChange = currentPeriodData.expense - previousPeriodData.expense;
        const expenseChangePercentage =
            previousPeriodData.expense > 0
                ? (expenseChange / previousPeriodData.expense) * 100
                : currentPeriodData.expense > 0
                ? 100
                : 0;

        return (
            <View style={styles.overviewContainer}>
                <AnimatedCard
                    delay={100}
                    style={[styles.overviewCard, { backgroundColor: colors.surface }]}
                >
                    <View style={styles.overviewHeader}>
                        <View
                            style={[
                                styles.overviewIcon,
                                { backgroundColor: colors.success + '20' },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="arrow-down-left"
                                size={24}
                                color={colors.success}
                            />
                        </View>
                        <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
                            Total Income
                        </Text>
                    </View>
                    <Text style={[styles.overviewAmount, { color: colors.text }]}>
                        {formatCurrency(currentPeriodData.income)}
                    </Text>
                    <View style={styles.overviewComparison}>
                        <Text
                            style={[
                                styles.overviewChange,
                                {
                                    color:
                                        incomeChange >= 0 ? colors.success : colors.danger,
                                },
                            ]}
                        >
                            {incomeChange >= 0 ? '↑' : '↓'}{' '}
                            {formatCurrency(Math.abs(incomeChange))}
                        </Text>
                        <Text style={[styles.overviewPercentage, { color: colors.textSecondary }]}>
                            ({incomeChangePercentage >= 0 ? '+' : ''}
                            {incomeChangePercentage.toFixed(1)}%)
                        </Text>
                    </View>
                    <Text style={[styles.overviewPrevious, { color: colors.textSecondary }]}>
                        vs {formatCurrency(previousPeriodData.income)}
                    </Text>
                </AnimatedCard>

                <AnimatedCard
                    delay={200}
                    style={[styles.overviewCard, { backgroundColor: colors.surface }]}
                >
                    <View style={styles.overviewHeader}>
                        <View
                            style={[
                                styles.overviewIcon,
                                { backgroundColor: colors.danger + '20' },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="arrow-up-right"
                                size={24}
                                color={colors.danger}
                            />
                        </View>
                        <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
                            Total Expense
                        </Text>
                    </View>
                    <Text style={[styles.overviewAmount, { color: colors.text }]}>
                        {formatCurrency(currentPeriodData.expense)}
                    </Text>
                    <View style={styles.overviewComparison}>
                        <Text
                            style={[
                                styles.overviewChange,
                                {
                                    color:
                                        expenseChange >= 0 ? colors.danger : colors.success,
                                },
                            ]}
                        >
                            {expenseChange >= 0 ? '↑' : '↓'}{' '}
                            {formatCurrency(Math.abs(expenseChange))}
                        </Text>
                        <Text style={[styles.overviewPercentage, { color: colors.textSecondary }]}>
                            ({expenseChangePercentage >= 0 ? '+' : ''}
                            {expenseChangePercentage.toFixed(1)}%)
                        </Text>
                    </View>
                    <Text style={[styles.overviewPrevious, { color: colors.textSecondary }]}>
                        vs {formatCurrency(previousPeriodData.expense)}
                    </Text>
                </AnimatedCard>
            </View>
        );
    };

    const renderCategoryItem = (item: CategoryAnalytics, index: number) => {
        const isPositiveChange = item.type === 'income' ? item.change >= 0 : item.change <= 0;
        const changeColor = isPositiveChange ? colors.success : colors.danger;

        return (
            <AnimatedCard
                key={item.categoryId}
                delay={300 + index * 50}
                style={[styles.categoryCard, { backgroundColor: colors.surface }]}
            >
                <View style={styles.categoryHeader}>
                    <View style={styles.categoryTitleRow}>
                        <View
                            style={[
                                styles.categoryColorDot,
                                { backgroundColor: item.categoryColor },
                            ]}
                        />
                        <Text style={[styles.categoryName, { color: colors.text }]}>
                            {item.categoryName}
                        </Text>
                        <View
                            style={[
                                styles.categoryTypeBadge,
                                {
                                    backgroundColor:
                                        item.type === 'income'
                                            ? colors.success + '20'
                                            : colors.danger + '20',
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryTypeText,
                                    {
                                        color:
                                            item.type === 'income'
                                                ? colors.success
                                                : colors.danger,
                                    },
                                ]}
                            >
                                {item.type === 'income' ? 'Income' : 'Expense'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.categoryAmounts}>
                    <View style={styles.categoryAmountRow}>
                        <Text style={[styles.categoryAmountLabel, { color: colors.textSecondary }]}>
                            Current:
                        </Text>
                        <Text style={[styles.categoryAmount, { color: colors.text }]}>
                            {formatCurrency(item.currentAmount)}
                        </Text>
                    </View>
                    <View style={styles.categoryAmountRow}>
                        <Text style={[styles.categoryAmountLabel, { color: colors.textSecondary }]}>
                            Previous:
                        </Text>
                        <Text style={[styles.categoryAmount, { color: colors.textSecondary }]}>
                            {formatCurrency(item.previousAmount)}
                        </Text>
                    </View>
                </View>

                <View style={styles.categoryChange}>
                    <View style={styles.categoryChangeRow}>
                        <MaterialCommunityIcons
                            name={item.change >= 0 ? 'arrow-up' : 'arrow-down'}
                            size={20}
                            color={changeColor}
                        />
                        <Text style={[styles.categoryChangeAmount, { color: changeColor }]}>
                            {formatCurrency(Math.abs(item.change))}
                        </Text>
                        <Text style={[styles.categoryChangePercentage, { color: changeColor }]}>
                            ({item.changePercentage >= 0 ? '+' : ''}
                            {item.changePercentage.toFixed(1)}%)
                        </Text>
                    </View>
                </View>
            </AnimatedCard>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading analytics...
                    </Text>
                </View>
            </View>
        );
    }

    const expenseAnalytics = categoryAnalytics.filter((a) => a.type === 'expense');
    const incomeAnalytics = categoryAnalytics.filter((a) => a.type === 'income');

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {renderPeriodSelector()}
                {renderComparisonSelector()}
                {renderOverviewCards()}

                {/* Expense Categories */}
                {expenseAnalytics.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons
                                name="chart-bar"
                                size={24}
                                color={colors.danger}
                            />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Expense Categories
                            </Text>
                        </View>
                        {expenseAnalytics.map((item, index) => renderCategoryItem(item, index))}
                    </View>
                )}

                {/* Income Categories */}
                {incomeAnalytics.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons
                                name="chart-line"
                                size={24}
                                color={colors.success}
                            />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Income Categories
                            </Text>
                        </View>
                        {incomeAnalytics.map((item, index) => renderCategoryItem(item, index))}
                    </View>
                )}

                {categoryAnalytics.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name="chart-box-outline"
                            size={80}
                            color={colors.textSecondary}
                        />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            No Data Available
                        </Text>
                        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                            There are no transactions in the selected period to analyze.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    loadingText: {
        fontSize: fontSize.md,
        marginTop: spacing.md,
    },
    selectorContainer: {
        marginBottom: spacing.lg,
    },
    selectorLabel: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semiBold,
        marginBottom: spacing.sm,
    },
    selectorButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    selectorButton: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectorButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    overviewContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    overviewCard: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    overviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    overviewIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    overviewLabel: {
        fontSize: fontSize.xs,
        flex: 1,
    },
    overviewAmount: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    overviewComparison: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    overviewChange: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semiBold,
    },
    overviewPercentage: {
        fontSize: fontSize.xs,
    },
    overviewPrevious: {
        fontSize: fontSize.xs,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    categoryCard: {
        padding: spacing.lg,
        borderRadius: 16,
        marginBottom: spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    categoryHeader: {
        marginBottom: spacing.md,
    },
    categoryTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    categoryColorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    categoryName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semiBold,
        flex: 1,
    },
    categoryTypeBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryTypeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
    categoryAmounts: {
        marginBottom: spacing.md,
    },
    categoryAmountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    categoryAmountLabel: {
        fontSize: fontSize.sm,
    },
    categoryAmount: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semiBold,
    },
    categoryChange: {
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    categoryChangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    categoryChangeAmount: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    categoryChangePercentage: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    emptyDescription: {
        fontSize: fontSize.md,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
});

export default AnalyticsScreen;
