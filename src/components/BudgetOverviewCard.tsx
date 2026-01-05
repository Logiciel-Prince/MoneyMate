import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, spacing } from '../theme/spacing';
import { formatCurrency } from '../utils/currency';

interface BudgetOverviewCardProps {
    totalBudgeted: number;
    totalSpent: number;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
    totalBudgeted,
    totalSpent,
}) => {
    // We use a fixed blue color to match the design, 
    // regardless of theme, as it's a featured card. 
    // Or we could use colors.primary but ensure it contrasts well with text.
    // The design shows white text on blue.
    
    // Calculate remaining
    const remaining = totalBudgeted - totalSpent;
    const progress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    const safeProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <View style={styles.container}>
             <Text style={styles.label}>Total Budget</Text>
             <Text style={styles.remainingAmount}>{formatCurrency(remaining)}</Text>
             <Text style={styles.remainingLabel}>Remaining</Text>

             <View style={styles.row}>
                 <View>
                     <Text style={styles.subLabel}>Budgeted</Text>
                     <Text style={styles.subValue}>{formatCurrency(totalBudgeted)}</Text>
                 </View>
                 <View style={{ alignItems: 'flex-end' }}>
                     <Text style={styles.subLabel}>Spent</Text>
                     <Text style={styles.subValue}>{formatCurrency(totalSpent)}</Text>
                 </View>
             </View>

             <View style={styles.progressBarBg}>
                 <View style={[styles.progressBarFill, { width: `${safeProgress}%` }]} />
             </View>
             
             <View style={styles.footerRow}>
                 <Text style={styles.percentage}>{progress.toFixed(1)}% used</Text>
             </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2563EB', // Vibrant Blue
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        paddingBottom: spacing.md,
        marginBottom: spacing.lg,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    remainingAmount: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 0,
    },
    remainingLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginBottom: spacing.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    subLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginBottom: 2,
    },
    subValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    footerRow: {
        alignItems: 'flex-end',
        marginTop: 4,
    },
    percentage: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '500',
    }
});
