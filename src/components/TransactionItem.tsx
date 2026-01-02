import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Transaction, TransactionCategory, TransactionType } from '../types/Transaction';
import { formatCurrency } from '../utils/currency';

/**
 * Props for TransactionItem component
 */
export interface TransactionItemProps {
  /**
   * Transaction data to display
   */
  transaction: Transaction;

  /**
   * Callback when item is pressed
   */
  onPress?: (transaction: Transaction) => void;

  /**
   * Callback when long press
   */
  onLongPress?: (transaction: Transaction) => void;

  /**
   * Whether to show the date
   */
  showDate?: boolean;

  /**
   * Whether the item is in a selected state
   */
  isSelected?: boolean;
}

/**
 * Get icon emoji for transaction category
 */
function getCategoryIcon(category: TransactionCategory): string {
  switch (category) {
    // Income categories
    case TransactionCategory.SALARY:
      return '💼';
    case TransactionCategory.FREELANCE:
      return '💻';
    case TransactionCategory.INVESTMENT:
      return '📈';
    case TransactionCategory.GIFT:
      return '🎁';
    case TransactionCategory.REFUND:
      return '↩️';
    case TransactionCategory.OTHER_INCOME:
      return '💰';

    // Expense categories
    case TransactionCategory.FOOD:
      return '🍔';
    case TransactionCategory.TRANSPORT:
      return '🚗';
    case TransactionCategory.SHOPPING:
      return '🛍️';
    case TransactionCategory.ENTERTAINMENT:
      return '🎬';
    case TransactionCategory.BILLS:
      return '📄';
    case TransactionCategory.HEALTHCARE:
      return '🏥';
    case TransactionCategory.EDUCATION:
      return '📚';
    case TransactionCategory.TRAVEL:
      return '✈️';
    case TransactionCategory.GROCERIES:
      return '🛒';
    case TransactionCategory.UTILITIES:
      return '💡';
    case TransactionCategory.RENT:
      return '🏠';
    case TransactionCategory.OTHER_EXPENSE:
      return '💸';

    default:
      return '💰';
  }
}

/**
 * Get display label for transaction category
 */
function getCategoryLabel(category: TransactionCategory): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format date to readable string
 */
function formatDate(date: Date): string {
  const now = new Date();
  const transactionDate = new Date(date);
  const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return transactionDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: transactionDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * TransactionItem component - displays transaction information
 */
export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onLongPress,
  showDate = true,
  isSelected = false,
}) => {
  const handlePress = () => {
    onPress?.(transaction);
  };

  const handleLongPress = () => {
    onLongPress?.(transaction);
  };

  const isCredit = transaction.type === TransactionType.CREDIT;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      disabled={!onPress && !onLongPress}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getCategoryIcon(transaction.category)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.category}>
            {getCategoryLabel(transaction.category)}
          </Text>
          {showDate && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.date}>
                {formatDate(transaction.date)}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            isCredit ? styles.amountCredit : styles.amountDebit,
          ]}
        >
          {isCredit ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: lightColors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: lightColors.border,
    },
    containerSelected: {
        borderColor: lightColors.primary,
        borderWidth: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: lightColors.backgroundSecondary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.sm,
    },
    icon: {
        fontSize: 28,
    },
    content: {
        flex: 1,
        marginRight: spacing.sm,
    },
    title: {
        ...typography.body.medium,
        color: lightColors.text,
        marginBottom: 2,
    },
    metaContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    category: {
        ...typography.caption.medium,
        color: lightColors.textSecondary,
    },
    separator: {
        ...typography.caption.medium,
        color: lightColors.textTertiary,
        marginHorizontal: 4,
    },
    date: {
        ...typography.caption.medium,
        color: lightColors.textTertiary,
    },
    amountContainer: {
        alignItems: "flex-end",
    },
    amount: {
        ...typography.heading.h5,
        fontWeight: typography.heading.h4.fontWeight,
    },
    amountCredit: {
        color: lightColors.success,
    },
    amountDebit: {
        color: lightColors.danger,
    },
});

export default TransactionItem;
