import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";
import { fontSize, fontWeight } from "../theme/typography";

// Enable layout animation for Android
if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CHART_FOOTER_HEIGHT = 24;

export interface MonthlyData {
    income: number;
    expense: number;
    month: string;
}

interface CustomBarChartProps {
    data: MonthlyData[];
    height?: number;
    title?: string;
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({
    data,
    height = 180,
    title = "Analytics",
}) => {
    const { colors } = useTheme();
    const { currencySymbol } = useCurrency();
    const [selectedIndex, setSelectedIndex] = useState<number>(data.length - 1);

    const availableHeight = height - CHART_FOOTER_HEIGHT;

    useEffect(() => {
        if (data.length > 0) {
            setSelectedIndex(data.length - 1);
        }
    }, [data]);

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
    };

    const maxChartValue = useMemo(() => {
        const max = Math.max(
            ...data.flatMap((d) => [d.income, d.expense]),
            100
        );
        return max * 1.1; // 10% headroom
    }, [data]);

    const formatCompactCurrency = (amount: number): string => {
        if (amount >= 10000000)
            return `${currencySymbol}${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000)
            return `${currencySymbol}${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000)
            return `${currencySymbol}${(amount / 1000).toFixed(0)}k`;
        return `${currencySymbol}${amount.toFixed(0)}`;
    };

    const selectedData = data[selectedIndex] || {
        month: "",
        income: 0,
        expense: 0,
    };
    const gridLines = [1, 0.75, 0.5, 0.25, 0];

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {title}
                    </Text>
                </View>

                <View style={styles.statsContainer}>
                    <View
                        style={{
                            justifyContent: "center",
                            marginRight: spacing.sm,
                        }}
                    >
                        <Text
                            style={[
                                styles.subtitle,
                                { color: colors.textSecondary, marginTop: 0 },
                            ]}
                        >
                            {selectedData.month || "Last 6 Months"}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <View
                            style={[
                                styles.dot,
                                { backgroundColor: colors.success },
                            ]}
                        />
                        <Text
                            style={[styles.statValue, { color: colors.text }]}
                        >
                            {formatCompactCurrency(selectedData.income || 0)}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <View
                            style={[
                                styles.dot,
                                { backgroundColor: colors.danger },
                            ]}
                        />
                        <Text
                            style={[styles.statValue, { color: colors.text }]}
                        >
                            {formatCompactCurrency(selectedData.expense || 0)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Chart Body */}
            <View style={[styles.chartBody, { height }]}>
                {/* Grid Lines */}
                <View style={styles.gridContainer}>
                    {gridLines.map((ratio, index) => (
                        <View key={index} style={styles.gridLineRow}>
                            <Text
                                style={[
                                    styles.gridLabel,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                {formatCompactCurrency(maxChartValue * ratio)}
                            </Text>
                            <View
                                style={[
                                    styles.gridLine,
                                    { backgroundColor: colors.border },
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Bars */}
                <View style={[styles.barsContainer, { height }]}>
                    {data.map((item, index) => {
                        const incomeH =
                            maxChartValue > 0
                                ? (item.income / maxChartValue) *
                                  availableHeight
                                : 4;
                        const expenseH =
                            maxChartValue > 0
                                ? (item.expense / maxChartValue) *
                                  availableHeight
                                : 4;
                        const isSelected = selectedIndex === index;

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.barGroup,
                                    isSelected && styles.selectedBarGroup,
                                ]}
                                onPress={() => handleSelect(index)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.barsWrapper}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: Math.max(incomeH, 4),
                                                backgroundColor: colors.success,
                                                opacity: isSelected ? 1 : 0.5,
                                            },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: Math.max(expenseH, 4),
                                                backgroundColor: colors.danger,
                                                opacity: isSelected ? 1 : 0.5,
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.monthLabelContainer}>
                                    <Text
                                        style={[
                                            styles.monthLabel,
                                            {
                                                color: isSelected
                                                    ? colors.text
                                                    : colors.textSecondary,
                                                fontWeight: isSelected
                                                    ? fontWeight.bold
                                                    : fontWeight.medium,
                                            },
                                        ]}
                                    >
                                        {item.month}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    subtitle: {
        fontSize: fontSize.sm,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statValue: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },
    chartBody: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    gridContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: CHART_FOOTER_HEIGHT, // Reserve space for labels
        justifyContent: 'space-between',
    },
    gridLineRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridLabel: {
        width: 30,
        fontSize: 10,
        textAlign: 'right',
        marginRight: spacing.sm,
    },
    gridLine: {
        flex: 1,
        height: 1,
        opacity: 0.1,
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between', // Distribute space evenly
        alignItems: 'flex-end',
        marginLeft: 30, // reserved for grid labels
    },
    barGroup: {
        alignItems: 'center',
        flex: 1, // Take available width
        height: '100%',
        justifyContent: 'flex-end',
    },
    selectedBarGroup: {
        backgroundColor: 'rgba(128,128,128,0.05)',
        borderRadius: 8,
    },
    barsWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    bar: {
        width: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        minHeight: 4,
    },
    monthLabelContainer: {
        height: CHART_FOOTER_HEIGHT,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthLabel: {
        fontSize: 10,
        textAlign: 'center',
    }
});

export default CustomBarChart;
