import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";
import { fontSize, fontWeight } from "../theme/typography";

interface CategoryExpense {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

interface ExpensePieChartProps {
    data: CategoryExpense[];
    totalExpense: number;
    monthName?: string;
    onPrevMonth?: () => void;
    onNextMonth?: () => void;
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({
    data,
    totalExpense,
    monthName = new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
    }),
    onPrevMonth,
    onNextMonth,
}) => {
    const { colors } = useTheme();
    const { currencySymbol } = useCurrency();

    const pieData = data.map((item) => ({
        value: item.amount,
        color: item.color,
        text: `${item.percentage.toFixed(1)}%`,
        focused: false, // can handle interactions later
    }));

    const formatCurrency = (amount: number) => {
        return `${currencySymbol}${amount.toLocaleString("en-IN")}`;
    };

    const renderCenterLabel = () => {
        return (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text
                    style={{
                        color: colors.textSecondary,
                        fontSize: 10,
                        marginBottom: 2,
                    }}
                >
                    TOTAL
                </Text>
                <Text
                    style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: "bold",
                    }}
                >
                    {formatCurrency(totalExpense)}
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Expense Breakdown
                </Text>
                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity
                        onPress={onPrevMonth}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text
                            style={[
                                styles.arrow,
                                { color: colors.textSecondary },
                            ]}
                        >
                            {"<"}
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.monthText, { color: colors.text }]}>
                        {monthName}
                    </Text>
                    <TouchableOpacity
                        onPress={onNextMonth}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text
                            style={[
                                styles.arrow,
                                { color: colors.textSecondary },
                            ]}
                        >
                            {">"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chart Area */}
            <View style={styles.chartContainer}>
                <PieChart
                    data={pieData}
                    donut
                    radius={90}
                    innerRadius={60}
                    centerLabelComponent={renderCenterLabel}
                    backgroundColor={colors.surface} // match container
                />
            </View>

            {/* Legend List */}
            <View style={styles.legendContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.legendRow}>
                        {/* Name & Dot */}
                        <View style={styles.legendLeft}>
                            <View
                                style={[
                                    styles.dot,
                                    { backgroundColor: item.color },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.categoryName,
                                    { color: colors.text },
                                ]}
                            >
                                {item.category}
                            </Text>
                        </View>

                        {/* Percentage Badge */}
                        <View
                            style={[
                                styles.percentBadge,
                                { backgroundColor: colors.background },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.percentText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                {item.percentage.toFixed(1)}%
                            </Text>
                        </View>

                        {/* Amount */}
                        <Text
                            style={[styles.amountText, { color: colors.text }]}
                        >
                            {formatCurrency(item.amount)}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        borderRadius: 24,
        marginBottom: spacing.lg,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
    },
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
    },
    monthText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    arrow: {
        fontSize: fontSize.lg,
        paddingHorizontal: spacing.sm,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    legendContainer: {
        gap: spacing.sm,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Take available space
        gap: spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    categoryName: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    percentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: spacing.md,
        minWidth: 50,
        alignItems: 'center',
    },
    percentText: {
        fontSize: 10,
        fontWeight: fontWeight.bold,
    },
    amountText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        minWidth: 70, // Align amounts
        textAlign: 'right',
    },
});

export default ExpensePieChart;
