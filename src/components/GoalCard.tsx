import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Goal } from '../types/Goal';
import { formatCurrency } from '../utils/currency';

/**
 * Props for GoalCard component
 */
export interface GoalCardProps {
  /**
   * Goal data to display
   */
  goal: Goal;

  /**
   * Callback when card is pressed
   */
  onPress?: (goal: Goal) => void;

  /**
   * Callback when long press
   */
  onLongPress?: (goal: Goal) => void;

  /**
   * Whether the card is in a selected state
   */
  isSelected?: boolean;
}

/**
 * Calculate progress percentage
 */
function calculateProgress(savedAmount: number, targetAmount: number): number {
  if (targetAmount === 0) return 0;
  const progress = (savedAmount / targetAmount) * 100;
  return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
}

/**
 * Get progress color based on percentage
 */
function getProgressColor(progress: number): string {
  if (progress >= 100) return lightColors.success;
  if (progress >= 75) return lightColors.info;
  if (progress >= 50) return lightColors.warning;
  return lightColors.danger;
}

/**
 * Format date to readable string
 */
function formatCreatedDate(date: Date): string {
  const createdDate = new Date(date);
  return createdDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * GoalCard component - displays savings goal information
 */
export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onPress,
  onLongPress,
  isSelected = false,
}) => {
  const handlePress = () => {
    onPress?.(goal);
  };

  const handleLongPress = () => {
    onLongPress?.(goal);
  };

  const progress = calculateProgress(goal.savedAmount, goal.targetAmount);
  const progressColor = getProgressColor(progress);
  const remainingAmount = goal.targetAmount - goal.savedAmount;
  const isCompleted = progress >= 100;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        isCompleted && styles.containerCompleted,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      disabled={!onPress && !onLongPress}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{isCompleted ? '🎯' : '💰'}</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.goalName} numberOfLines={1}>
            {goal.name}
          </Text>
          <Text style={styles.createdDate}>
            Created {formatCreatedDate(goal.createdAt)}
          </Text>
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.amountContainer}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Saved</Text>
          <Text style={[styles.amountValue, { color: progressColor }]}>
            {formatCurrency(goal.savedAmount)}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Target</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(goal.targetAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={[styles.progressPercentage, { color: progressColor }]}>
            {progress.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
        {!isCompleted && (
          <Text style={styles.remainingText}>
            {formatCurrency(remainingAmount)} remaining
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: lightColors.border,
    shadowColor: lightColors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  containerSelected: {
    borderColor: lightColors.primary,
    borderWidth: 2,
  },
  containerCompleted: {
    borderColor: lightColors.success,
    backgroundColor: lightColors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: lightColors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  goalName: {
    ...typography.heading.h5,
    color: lightColors.text,
    marginBottom: 2,
  },
  createdDate: {
    ...typography.caption.medium,
    color: lightColors.textSecondary,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: lightColors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: lightColors.white,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.borderLight,
  },
  amountRow: {
    flex: 1,
  },
  amountLabel: {
    ...typography.caption.medium,
    color: lightColors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    ...typography.heading.h5,
    color: lightColors.text,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.body.small,
    color: lightColors.textSecondary,
  },
  progressPercentage: {
    ...typography.body.small,
    fontWeight: typography.fontWeight.semiBold,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: lightColors.backgroundTertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  remainingText: {
    ...typography.caption.medium,
    color: lightColors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default GoalCard;
