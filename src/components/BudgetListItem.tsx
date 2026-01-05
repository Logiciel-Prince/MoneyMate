import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing } from '../theme/spacing';
import { fontWeight } from '../theme/typography';
import { Budget } from '../types/Budget';
import { CustomCategory } from '../types/Category';
import { formatCurrency } from '../utils/currency';

interface BudgetListItemProps {
    budget: Budget;
    spent: number;
    category: CustomCategory;
    onDelete?: (id: string) => void;
    trend?: number | null;
}

export const BudgetListItem: React.FC<BudgetListItemProps> = ({
    budget,
    spent,
    category,
    onDelete,
    trend,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const progress = (spent / budget.limit) * 100;
    const safeProgress = Math.min(Math.max(progress, 0), 100);

    // Color logic for progress bar
    let progressColor = '#10B981'; // Green
    if (progress > 80) progressColor = '#F59E0B'; // Yellow/Orange
    if (progress > 100) progressColor = '#EF4444'; // Red

    const iconName = (category.icon as any) || 'currency-usd';

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.iconWrapper}>
                    <View style={[styles.iconCircle, { backgroundColor: category.color || colors.primary }]}>
                         <MaterialCommunityIcons name={iconName} size={24} color="#fff" />
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{category.name}</Text>
                        <Text style={styles.period}>{budget.period ? budget.period.charAt(0).toUpperCase() + budget.period.slice(1) : 'Monthly'}</Text>
                    </View>
                </View>

                <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>
                        <Text style={{ color: colors.text }}>{formatCurrency(spent)}</Text>
                        <Text style={{ color: colors.textSecondary }}> / {formatCurrency(budget.limit)}</Text>
                    </Text>
                    {onDelete && (
                        <TouchableOpacity onPress={() => onDelete(budget.id)} style={styles.deleteButton}>
                             <MaterialCommunityIcons name="delete-outline" size={20} color={colors.danger} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${safeProgress}%`, backgroundColor: progressColor }]} />
            </View>

            <View style={styles.footerRow}>
                <Text style={styles.usageText}>{progress.toFixed(1)}% used</Text>
                {trend !== undefined && trend !== null && (
                    <Text style={styles.trendText}>
                         <Text style={{ color: trend > 0 ? colors.danger : colors.success }}>
                             {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                         </Text>
                         {' vs last mo.'}
                    </Text>
                )}
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        // Shadow/Elevation
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    iconWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    titleContainer: {
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    period: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 14,
        fontWeight: fontWeight.bold,
        marginBottom: 4,
    },
    deleteButton: {
        padding: 4,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: 3,
        marginBottom: spacing.sm,
        marginTop: spacing.xs,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    usageText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    trendText: {
        fontSize: 12,
        color: colors.textSecondary,
    }
});
