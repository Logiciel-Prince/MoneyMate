import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, spacing } from '../theme/spacing';
import { formatCurrency } from '../utils/currency';

interface GoalsOverviewCardProps {
    totalSaved: number;
    totalTarget: number;
    completedCount: number;
    totalCount: number;
}

export const GoalsOverviewCard: React.FC<GoalsOverviewCardProps> = ({
    totalSaved,
    totalTarget,
    completedCount,
    totalCount,
}) => {
    // Using a vibrant distinctive color for Goals (e.g., Purple/Indigo or stick to Blue but distinct)
    // Budgets was Blue (#2563EB). Let's use a Purple/Violet for Goals to distinguish? 
    // Or keep Blue for consistency?
    // "Match it with other screens" -> implies consistency. 
    // The user explicitly asked to "match with other screen cards". 
    // BudgetOverviewCard uses #2563EB. So we use that.
    const backgroundColor = '#2563EB'; // Blue to match BudgetOverviewCard

    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const safeProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <View style={[styles.container, { backgroundColor }]}>
             <Text style={styles.label}>Total Savings</Text>
             <Text style={styles.amount}>{formatCurrency(totalSaved)}</Text>
             <Text style={styles.subLabel}>of {formatCurrency(totalTarget)} target</Text>

             <View style={styles.progressBarBg}>
                 <View style={[styles.progressBarFill, { width: `${safeProgress}%` }]} />
             </View>
             
             <View style={styles.footerRow}>
                 <Text style={styles.percentage}>{progress.toFixed(1)}% achieved</Text>
                 <Text style={styles.countText}>{completedCount}/{totalCount} goals reached</Text>
             </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
    },
    amount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginBottom: spacing.lg,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    percentage: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    countText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    }
});
