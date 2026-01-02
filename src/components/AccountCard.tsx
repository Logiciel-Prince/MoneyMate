import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Account, AccountType } from '../types/Account';
import { formatCurrency } from '../utils/currency';

/**
 * Props for AccountCard component
 */
export interface AccountCardProps {
  /**
   * Account data to display
   */
  account: Account;

  /**
   * Callback when card is pressed
   */
  onPress?: (account: Account) => void;

  /**
   * Callback when long press
   */
  onLongPress?: (account: Account) => void;

  /**
   * Whether the card is in a selected state
   */
  isSelected?: boolean;
}

/**
 * Get icon emoji for account type
 */
function getAccountIcon(type: AccountType): string {
  switch (type) {
    case AccountType.SAVINGS:
      return '🏦';
    case AccountType.CHECKING:
      return '💳';
    case AccountType.CREDIT_CARD:
      return '💳';
    case AccountType.CASH:
      return '💵';
    case AccountType.INVESTMENT:
      return '📈';
    case AccountType.OTHER:
      return '💰';
    default:
      return '💰';
  }
}

/**
 * Get display label for account type
 */
function getAccountTypeLabel(type: AccountType): string {
  switch (type) {
    case AccountType.SAVINGS:
      return 'Savings';
    case AccountType.CHECKING:
      return 'Checking';
    case AccountType.CREDIT_CARD:
      return 'Credit Card';
    case AccountType.CASH:
      return 'Cash';
    case AccountType.INVESTMENT:
      return 'Investment';
    case AccountType.OTHER:
      return 'Other';
    default:
      return 'Account';
  }
}

/**
 * AccountCard component - displays account information
 */
export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onPress,
  onLongPress,
  isSelected = false,
}) => {
  const handlePress = () => {
    onPress?.(account);
  };

  const handleLongPress = () => {
    onLongPress?.(account);
  };

  const isNegative = account.balance < 0;

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
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getAccountIcon(account.type)}</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.accountName} numberOfLines={1}>
            {account.name}
          </Text>
          <Text style={styles.accountType}>
            {getAccountTypeLabel(account.type)}
          </Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text
          style={[
            styles.balanceAmount,
            isNegative && styles.balanceNegative,
          ]}
        >
          {formatCurrency(account.balance)}
        </Text>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: lightColors.backgroundSecondary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.sm,
    },
    icon: {
        fontSize: 32,
    },
    headerContent: {
        flex: 1,
    },
    accountName: {
        ...typography.heading.h5,
        color: lightColors.text,
        marginBottom: 2,
    },
    accountType: {
        ...typography.caption.medium,
        color: lightColors.textSecondary,
        textTransform: "capitalize",
    },
    balanceContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: lightColors.borderLight,
    },
    balanceLabel: {
        ...typography.body.small,
        color: lightColors.textSecondary,
    },
    balanceAmount: {
        ...typography.heading.h4,
        color: lightColors.primary,
    },
    balanceNegative: {
        color: lightColors.danger,
    },
});

export default AccountCard;
