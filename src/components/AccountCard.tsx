import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { Account, AccountType } from "../types/Account";
import { formatCurrency } from "../utils/currency";

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
            return "🏦";
        case AccountType.CHECKING:
            return "💳";
        case AccountType.CREDIT_CARD:
            return "💳";
        case AccountType.CASH:
            return "💵";
        case AccountType.INVESTMENT:
            return "📈";
        case AccountType.OTHER:
            return "💰";
        default:
            return "💰";
    }
}

/**
 * Get display label for account type
 */
function getAccountTypeLabel(type: AccountType): string {
    switch (type) {
        case AccountType.SAVINGS:
            return "Savings";
        case AccountType.CHECKING:
            return "Checking";
        case AccountType.CREDIT_CARD:
            return "Credit Card";
        case AccountType.CASH:
            return "Cash";
        case AccountType.INVESTMENT:
            return "Investment";
        case AccountType.OTHER:
            return "Other";
        default:
            return "Account";
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
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const handlePress = () => {
        onPress?.(account);
    };

    const handleLongPress = () => {
        onLongPress?.(account);
    };

    const isNegative = account.balance < 0;

    return (
        <TouchableOpacity
            style={[styles.container, isSelected && styles.containerSelected]}
            onPress={handlePress}
            onLongPress={handleLongPress}
            activeOpacity={0.7}
            disabled={!onPress && !onLongPress}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>
                        {getAccountIcon(account.type)}
                    </Text>
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

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        containerSelected: {
            borderColor: colors.primary,
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
            backgroundColor: colors.backgroundSecondary,
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
            color: colors.text,
            marginBottom: 2,
        },
        accountType: {
            ...typography.caption.medium,
            color: colors.textSecondary,
            textTransform: "capitalize",
        },
        balanceContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        balanceLabel: {
            ...typography.body.small,
            color: colors.textSecondary,
        },
        balanceAmount: {
            ...typography.heading.h4,
            color: colors.primary,
        },
        balanceNegative: {
            color: colors.danger,
        },
    });

export default AccountCard;
