import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

type TimeHorizon = 'monthly' | 'yearly';

interface PeriodData {
    label: string;
    shortLabel: string;
    amount: number;
    date: Date;
    isCurrent: boolean;
}

interface CategoryStats {
    currentAmount: number;
    previousAmount: number;
    change: number;
    changePercentage: number;
    average: number;
    trend: 'up' | 'down' | 'neutral';
}

export const CategoryAnalyticsScreen: React.FC = () => {
    const { colors } = useTheme();
    const { formatCurrency } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('monthly');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<CustomCategory[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(0);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [storedTransactions, storedCategories] = await Promise.all([
                storage.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS),
                storage.getData<CustomCategory[]>(STORAGE_KEYS.CATEGORIES),
            ]);

            const txns = (storedTransactions || []).map((t) => ({
                ...t,
                date: new Date(t.date),
            }));

            const cats = storedCategories && storedCategories.length > 0
                ? storedCategories
                : getAllDefaultCategories();

            setTransactions(txns);
            setCategories(cats);

            // Auto-select first category with transactions if none selected
            if (!selectedCategory && txns.length > 0) {
                const categoryWithData = cats.find((cat) =>
                    txns.some((t) => t.category === cat.id)
                );
                if (categoryWithData) {
                    setSelectedCategory(categoryWithData.id);
                }
            }
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // Get selected category object
    const category = useMemo(() => {
        return categories.find((c) => c.id === selectedCategory) || null;
    }, [categories, selectedCategory]);

    // Calculate period data using useMemo for performance
    const periodData = useMemo((): PeriodData[] => {
        if (!category) return [];

        const now = new Date();
        const periods: PeriodData[] = [];
        const isIncome = category.type === 'income';
        const transactionType = isIncome ? TransactionType.CREDIT : TransactionType.DEBIT;

        if (timeHorizon === 'monthly') {
            // Last 6 months
            for (let i = 5; i >= 0; i--) {
                const periodDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const periodStart = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
                const periodEnd = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);
                periodEnd.setHours(23, 59, 59, 999);

                const amount = transactions
                    .filter(
                        (t) =>
                            t.category === category.id &&
                            t.type === transactionType &&
                            t.date >= periodStart &&
                            t.date <= periodEnd
                    )
                    .reduce((sum, t) => sum + t.amount, 0);

                periods.push({
                    label: periodDate.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                    }),
                    shortLabel: periodDate.toLocaleDateString('en-US', { month: 'short' }),
                    amount,
                    date: periodDate,
                    isCurrent: i === 0,
                });
            }
        } else {
            // Last 3 years
            for (let i = 2; i >= 0; i--) {
                const year = now.getFullYear() - i;
                const periodStart = new Date(year, 0, 1);
                const periodEnd = new Date(year, 11, 31, 23, 59, 59, 999);

                const amount = transactions
                    .filter(
                        (t) =>
                            t.category === category.id &&
                            t.type === transactionType &&
                            t.date >= periodStart &&
                            t.date <= periodEnd
                    )
                    .reduce((sum, t) => sum + t.amount, 0);

                periods.push({
                    label: year.toString(),
                    shortLabel: year.toString(),
                    amount,
                    date: periodStart,
                    isCurrent: i === 0,
                });
            }
        }

        return periods;
    }, [category, transactions, timeHorizon]);

    // Calculate statistics
    const stats = useMemo((): CategoryStats | null => {
        if (periodData.length < 2) return null;

        const currentPeriod = periodData[periodData.length - 1];
        const previousPeriod = periodData[periodData.length - 2];

        const change = currentPeriod.amount - previousPeriod.amount;
        const changePercentage =
            previousPeriod.amount > 0
                ? (change / previousPeriod.amount) * 100
                : currentPeriod.amount > 0
                ? 100
                : 0;

        const average =
            periodData.reduce((sum, p) => sum + p.amount, 0) / periodData.length;

        let trend: 'up' | 'down' | 'neutral' = 'neutral';
        if (Math.abs(changePercentage) > 5) {
            trend = change > 0 ? 'up' : 'down';
        }

        return {
            currentAmount: currentPeriod.amount,
            previousAmount: previousPeriod.amount,
            change,
            changePercentage,
            average,
            trend,
        };
    }, [periodData]);



    const renderCategoryPicker = () => {
        const incomeCategories = categories.filter((c) => c.type === 'income');
        const expenseCategories = categories.filter((c) => c.type === 'expense');

        return (
            <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>
                        Select Category
                    </Text>
                    <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                        <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {/* Income Categories */}
                    {incomeCategories.length > 0 && (
                        <View style={styles.pickerSection}>
                            <View style={[styles.sectionHeader, { backgroundColor: colors.success + '15' }]}>
                                <MaterialCommunityIcons name="arrow-down-left" size={20} color={colors.success} />
                                <Text style={[styles.pickerSectionTitle, { color: colors.success }]}>
                                    Income Categories
                                </Text>
                            </View>
                            {incomeCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.pickerItem,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: selectedCategory === cat.id ? colors.success : colors.border,
                                            borderWidth: selectedCategory === cat.id ? 2 : 1,
                                        },
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(cat.id);
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.categoryIcon,
                                            { backgroundColor: (cat.color || colors.success) + '20' },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.categoryDot,
                                                { backgroundColor: cat.color || colors.success },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.pickerItemText, { color: colors.text }]}>
                                        {cat.name}
                                    </Text>
                                    {selectedCategory === cat.id && (
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={24}
                                            color={colors.success}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Expense Categories */}
                    {expenseCategories.length > 0 && (
                        <View style={styles.pickerSection}>
                            <View style={[styles.sectionHeader, { backgroundColor: colors.danger + '15' }]}>
                                <MaterialCommunityIcons name="arrow-up-right" size={20} color={colors.danger} />
                                <Text style={[styles.pickerSectionTitle, { color: colors.danger }]}>
                                    Expense Categories
                                </Text>
                            </View>
                            {expenseCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.pickerItem,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: selectedCategory === cat.id ? colors.danger : colors.border,
                                            borderWidth: selectedCategory === cat.id ? 2 : 1,
                                        },
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(cat.id);
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.categoryIcon,
                                            { backgroundColor: (cat.color || colors.danger) + '20' },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.categoryDot,
                                                { backgroundColor: cat.color || colors.danger },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.pickerItemText, { color: colors.text }]}>
                                        {cat.name}
                                    </Text>
                                    {selectedCategory === cat.id && (
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={24}
                                            color={colors.danger}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    };

    // Update selected index when period data changes
    useEffect(() => {
        if (periodData.length > 0) {
            setSelectedPeriodIndex(periodData.length - 1);
        }
    }, [periodData.length]);

    const renderPerformanceChart = () => {
        if (periodData.length === 0) return null;

        const maxAmount = Math.max(...periodData.map((p) => p.amount), 100);
        const maxChartValue = maxAmount * 1.15; // 15% headroom

        const formatCompactCurrency = (amount: number): string => {
            if (amount >= 10000000) return formatCurrency(amount / 10000000).replace(/\.0+$/, '') + 'Cr';
            if (amount >= 100000) return formatCurrency(amount / 100000).replace(/\.0+$/, '') + 'L';
            if (amount >= 1000) return formatCurrency(amount / 1000).replace(/\.0+$/, '') + 'k';
            return formatCurrency(amount);
        };

        const selectedData = periodData[selectedPeriodIndex] || periodData[periodData.length - 1];

        return (
            <AnimatedCard delay={100} style={[styles.chartCard, { backgroundColor: colors.surface }]}>
                {/* Chart Header */}
                <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                        <MaterialCommunityIcons
                            name="chart-areaspline"
                            size={24}
                            color={category?.color || colors.primary}
                        />
                        <View style={styles.chartTitleTextContainer}>
                            <Text style={[styles.chartTitle, { color: colors.text }]}>
                                Trend Analysis
                            </Text>
                            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                                {timeHorizon === 'monthly' ? 'Last 6 Months' : 'Last 3 Years'}
                            </Text>
                        </View>
                    </View>
                    
                    {/* Selected Period Info */}
                    <View style={[styles.selectedPeriodBadge, { backgroundColor: (category?.color || colors.primary) + '15' }]}>
                        <Text style={[styles.selectedPeriodLabel, { color: colors.textSecondary }]}>
                            {selectedData.label}
                        </Text>
                        <Text style={[styles.selectedPeriodAmount, { color: category?.color || colors.primary }]}>
                            {formatCompactCurrency(selectedData.amount)}
                        </Text>
                    </View>
                </View>

                {/* Chart Body */}
                <View style={styles.chartBody}>
                    {/* Grid Lines */}
                    <View style={styles.gridContainer}>
                        {[1, 0.75, 0.5, 0.25, 0].map((ratio, index) => (
                            <View key={index} style={styles.gridRow}>
                                <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                                    {formatCompactCurrency(maxChartValue * ratio)}
                                </Text>
                                <View style={[styles.gridLine, { backgroundColor: colors.border }]} />
                            </View>
                        ))}
                    </View>

                    {/* Bars */}
                    <View style={styles.barsContainer}>
                        {periodData.map((period, index) => {
                            const barHeight = (period.amount / maxChartValue) * 160;
                            const isSelected = selectedPeriodIndex === index;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.barGroup}
                                    onPress={() => setSelectedPeriodIndex(index)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.barColumn}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: Math.max(barHeight, 4),
                                                    backgroundColor: category?.color || colors.primary,
                                                    opacity: isSelected ? 1 : 0.4,
                                                },
                                            ]}
                                        >
                                            {isSelected && (
                                                <View style={styles.barGlow} />
                                            )}
                                        </View>
                                    </View>
                                    <Text
                                        style={[
                                            styles.barLabel,
                                            {
                                                color: isSelected ? colors.text : colors.textSecondary,
                                                fontWeight: isSelected ? fontWeight.bold : fontWeight.medium,
                                            },
                                        ]}
                                    >
                                        {period.shortLabel}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </AnimatedCard>
        );
    };

    const renderInsightsCard = () => {
        if (!stats) return null;

        const isIncome = category?.type === 'income';
        const isPositiveChange = isIncome ? stats.change >= 0 : stats.change <= 0;
        const trendColor = isPositiveChange ? colors.success : colors.danger;
        const trendIcon = stats.change >= 0 ? 'trending-up' : 'trending-down';

        // Calculate difference from average
        const differenceFromAverage = stats.currentAmount - stats.average;
        const percentageFromAverage = stats.average > 0 
            ? (differenceFromAverage / stats.average) * 100 
            : 0;
        const isAboveAverage = differenceFromAverage > 0;
        
        // Determine if above/below average is good or bad based on category type
        const isAverageComparisonGood = isIncome ? isAboveAverage : !isAboveAverage;
        const averageComparisonColor = isAverageComparisonGood ? colors.success : colors.danger;
        const averageComparisonIcon = isAboveAverage ? 'arrow-up' : 'arrow-down';

        return (
            <AnimatedCard delay={200} style={[styles.insightsCard, { backgroundColor: colors.surface }]}>
                <View style={styles.insightsHeader}>
                    <MaterialCommunityIcons name="lightbulb-on" size={24} color={colors.warning} />
                    <Text style={[styles.insightsTitle, { color: colors.text }]}>
                        Key Insights
                    </Text>
                </View>

                {/* Current vs Previous */}
                <View style={[styles.insightRow, { backgroundColor: colors.background }]}>
                    <View style={styles.insightLeft}>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                            Current {timeHorizon === 'monthly' ? 'Month' : 'Year'}
                        </Text>
                        <Text style={[styles.insightValue, { color: colors.text }]}>
                            {formatCurrency(stats.currentAmount)}
                        </Text>
                    </View>
                    <View style={[styles.trendBadge, { backgroundColor: trendColor + '20' }]}>
                        <MaterialCommunityIcons name={trendIcon} size={20} color={trendColor} />
                        <Text style={[styles.trendText, { color: trendColor }]}>
                            {stats.changePercentage >= 0 ? '+' : ''}
                            {stats.changePercentage.toFixed(1)}%
                        </Text>
                    </View>
                </View>

                <View style={[styles.insightRow, { backgroundColor: colors.background }]}>
                    <View style={styles.insightLeft}>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                            Previous {timeHorizon === 'monthly' ? 'Month' : 'Year'}
                        </Text>
                        <Text style={[styles.insightValue, { color: colors.textSecondary }]}>
                            {formatCurrency(stats.previousAmount)}
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Average */}
                <View style={[styles.insightRow, { backgroundColor: colors.background }]}>
                    <View style={styles.insightLeft}>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                            Average ({timeHorizon === 'monthly' ? '6 Months' : '3 Years'})
                        </Text>
                        <Text style={[styles.insightValue, { color: colors.text }]}>
                            {formatCurrency(stats.average)}
                        </Text>
                    </View>
                </View>

                {/* Difference from Average */}
                {Math.abs(percentageFromAverage) > 5 && (
                    <View style={[styles.averageComparisonCard, { 
                        backgroundColor: averageComparisonColor + '10',
                        borderColor: averageComparisonColor + '30',
                    }]}>
                        <View style={styles.averageComparisonLeft}>
                            <View style={[styles.averageIconContainer, { backgroundColor: averageComparisonColor + '20' }]}>
                                <MaterialCommunityIcons 
                                    name={averageComparisonIcon} 
                                    size={20} 
                                    color={averageComparisonColor} 
                                />
                            </View>
                            <View style={styles.averageTextContainer}>
                                <Text style={[styles.averageComparisonLabel, { color: colors.textSecondary }]}>
                                    {isAboveAverage ? 'Above' : 'Below'} Average
                                </Text>
                                <Text style={[styles.averageComparisonValue, { color: averageComparisonColor }]}>
                                    {formatCurrency(Math.abs(differenceFromAverage))}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.averagePercentageBadge, { backgroundColor: averageComparisonColor + '20' }]}>
                            <Text style={[styles.averagePercentageText, { color: averageComparisonColor }]}>
                                {isAboveAverage ? '+' : '-'}{Math.abs(percentageFromAverage).toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                )}

                {/* Helpful message */}
                {Math.abs(percentageFromAverage) > 5 && (
                    <View style={styles.insightMessage}>
                        <MaterialCommunityIcons 
                            name="information-outline" 
                            size={16} 
                            color={colors.textSecondary} 
                        />
                        <Text style={[styles.insightMessageText, { color: colors.textSecondary }]}>
                            {isIncome ? (
                                isAboveAverage 
                                    ? `Great! You're earning more than your average ${timeHorizon === 'monthly' ? 'month' : 'year'}.`
                                    : `You're earning less than your average ${timeHorizon === 'monthly' ? 'month' : 'year'}.`
                            ) : (
                                isAboveAverage
                                    ? `You're spending more than your average ${timeHorizon === 'monthly' ? 'month' : 'year'}.`
                                    : `Good! You're spending less than your average ${timeHorizon === 'monthly' ? 'month' : 'year'}.`
                            )}
                        </Text>
                    </View>
                )}
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

    if (!category) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
                        <MaterialCommunityIcons
                            name="chart-box-outline"
                            size={64}
                            color={colors.primary}
                        />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        Select a Category
                    </Text>
                    <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                        Choose a category to view detailed analytics and spending trends
                    </Text>
                    <TouchableOpacity
                        style={[styles.selectButton, { backgroundColor: colors.primary }]}
                        onPress={() => setShowCategoryPicker(true)}
                    >
                        <MaterialCommunityIcons name="format-list-bulleted-square" size={20} color="#FFF" />
                        <Text style={styles.selectButtonText}>Browse Categories</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Category Selector */}
                <TouchableOpacity
                    style={[styles.categorySelector, { backgroundColor: colors.surface }]}
                    onPress={() => setShowCategoryPicker(true)}
                >
                    <View style={styles.categorySelectorLeft}>
                        <View
                            style={[
                                styles.categoryIconLarge,
                                { backgroundColor: (category.color || colors.primary) + '20' },
                            ]}
                        >
                            <View
                                style={[
                                    styles.categoryDotLarge,
                                    { backgroundColor: category.color || colors.primary },
                                ]}
                            />
                        </View>
                        <View>
                            <Text style={[styles.categoryName, { color: colors.text }]}>
                                {category.name}
                            </Text>
                            <View style={styles.categoryTypeRow}>
                                <MaterialCommunityIcons
                                    name={category.type === 'income' ? 'arrow-down-left' : 'arrow-up-right'}
                                    size={14}
                                    color={category.type === 'income' ? colors.success : colors.danger}
                                />
                                <Text style={[styles.categoryType, { color: colors.textSecondary }]}>
                                    {category.type === 'income' ? 'Income' : 'Expense'} Category
                                </Text>
                            </View>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* Time Horizon Toggle */}
                <View style={styles.horizonToggle}>
                    <TouchableOpacity
                        style={[
                            styles.horizonButton,
                            {
                                backgroundColor: timeHorizon === 'monthly' ? colors.primary : colors.surface,
                                borderColor: timeHorizon === 'monthly' ? colors.primary : colors.border,
                            },
                        ]}
                        onPress={() => setTimeHorizon('monthly')}
                    >
                        <MaterialCommunityIcons
                            name="calendar-month"
                            size={18}
                            color={timeHorizon === 'monthly' ? '#FFF' : colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.horizonButtonText,
                                {
                                    color: timeHorizon === 'monthly' ? '#FFF' : colors.textSecondary,
                                    fontWeight: timeHorizon === 'monthly' ? fontWeight.bold : fontWeight.medium,
                                },
                            ]}
                        >
                            Monthly
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.horizonButton,
                            {
                                backgroundColor: timeHorizon === 'yearly' ? colors.primary : colors.surface,
                                borderColor: timeHorizon === 'yearly' ? colors.primary : colors.border,
                            },
                        ]}
                        onPress={() => setTimeHorizon('yearly')}
                    >
                        <MaterialCommunityIcons
                            name="calendar"
                            size={18}
                            color={timeHorizon === 'yearly' ? '#FFF' : colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.horizonButtonText,
                                {
                                    color: timeHorizon === 'yearly' ? '#FFF' : colors.textSecondary,
                                    fontWeight: timeHorizon === 'yearly' ? fontWeight.bold : fontWeight.medium,
                                },
                            ]}
                        >
                            Yearly
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Performance Chart */}
                {renderPerformanceChart()}

                {/* Insights */}
                {renderInsightsCard()}


                {periodData.length === 0 && (
                    <View style={[styles.noDataCard, { backgroundColor: colors.surface }]}>
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={48}
                            color={colors.textSecondary}
                        />
                        <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                            No transactions found for this category in the selected time period
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Category Picker Modal */}
            {showCategoryPicker && renderCategoryPicker()}
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    emptyDescription: {
        fontSize: fontSize.md,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 12,
    },
    selectButtonText: {
        color: '#FFF',
        fontSize: fontSize.md,
        fontWeight: fontWeight.semiBold,
    },
    categorySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 16,
        marginBottom: spacing.lg,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    categorySelectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    categoryIconLarge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryDotLarge: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    categoryName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    categoryTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    categoryType: {
        fontSize: fontSize.xs,
    },
    horizonToggle: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    horizonButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        borderRadius: 12,
        borderWidth: 2,
    },
    horizonButtonText: {
        fontSize: fontSize.sm,
    },
    chartCard: {
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.lg,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chartHeader: {
        marginBottom: spacing.lg,
    },
    chartTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    chartTitleTextContainer: {
        flex: 1,
    },
    chartTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    chartSubtitle: {
        fontSize: fontSize.xs,
        marginTop: 2,
    },
    selectedPeriodBadge: {
        padding: spacing.md,
        borderRadius: 12,
    },
    selectedPeriodLabel: {
        fontSize: fontSize.xs,
        marginBottom: 2,
    },
    selectedPeriodAmount: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    chartBody: {
        height: 200,
        position: 'relative',
    },
    gridContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 24,
        justifyContent: 'space-between',
    },
    gridRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridLabel: {
        width: 40,
        fontSize: 10,
        textAlign: 'right',
        marginRight: spacing.sm,
    },
    gridLine: {
        flex: 1,
        height: 1,
        opacity: 0.15,
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginLeft: 48,
        paddingBottom: 24,
    },
    barGroup: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
    },
    barColumn: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    bar: {
        width: '80%',
        maxWidth: 40,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        position: 'relative',
    },
    barGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 12,
        opacity: 0.3,
    },
    barLabel: {
        fontSize: 10,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    insightsCard: {
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.lg,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    insightsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    insightsTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    insightRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.sm,
    },
    insightLeft: {
        flex: 1,
    },
    insightLabel: {
        fontSize: fontSize.xs,
        marginBottom: 4,
    },
    insightValue: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
    },
    trendText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },
    warningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    warningText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semiBold,
    },
    divider: {
        height: 1,
        marginVertical: spacing.md,
    },
    averageComparisonCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
        marginTop: spacing.sm,
        borderWidth: 1,
    },
    averageComparisonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    averageIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    averageTextContainer: {
        flex: 1,
    },
    averageComparisonLabel: {
        fontSize: fontSize.xs,
        marginBottom: 2,
    },
    averageComparisonValue: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    averagePercentageBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
    },
    averagePercentageText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },
    insightMessage: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: 'rgba(128,128,128,0.05)',
    },
    insightMessageText: {
        fontSize: fontSize.sm,
        flex: 1,
        lineHeight: 20,
    },
    transactionsCard: {
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.lg,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    transactionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    transactionsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    transactionsTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    countBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 28,
        alignItems: 'center',
    },
    countText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },
    transactionsList: {
        // No gap needed, separators handle spacing
    },
    compactTransactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    transactionLeft: {
        flex: 1,
        marginRight: spacing.md,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semiBold,
        marginBottom: 4,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
    },
    transactionDate: {
        fontSize: fontSize.xs,
    },
    metaSeparator: {
        fontSize: fontSize.xs,
        marginHorizontal: 4,
    },
    transactionDescription: {
        fontSize: fontSize.xs,
        flex: 1,
    },
    transactionRight: {
        alignItems: 'flex-end',
        minWidth: 80,
    },
    transactionAmount: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    transactionSeparator: {
        height: 1,
        opacity: 0.1,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        marginTop: spacing.sm,
        borderTopWidth: 1,
    },
    viewAllText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semiBold,
    },
    noDataCard: {
        padding: spacing.xxl,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    noDataText: {
        fontSize: fontSize.md,
        textAlign: 'center',
        marginTop: spacing.md,
        fontStyle: 'italic',
    },
    pickerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        elevation: 10,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
    },
    pickerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    pickerScroll: {
        flex: 1,
        padding: spacing.lg,
    },
    pickerSection: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    pickerSectionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.sm,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    pickerItemText: {
        fontSize: fontSize.md,
        flex: 1,
        fontWeight: fontWeight.medium,
    },
});

export default CategoryAnalyticsScreen;
