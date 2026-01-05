import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";
import { fontWeight, typography } from "../theme/typography";
import { CustomCategory } from "../types/Category";
import { Transaction, TransactionType } from "../types/Transaction";
import { formatCurrency } from "../utils/currency";

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
    /**
     * Whether the item is in a selected state
     */
    isSelected?: boolean;

    /**
     * List of custom categories for lookup
     */
    customCategories?: CustomCategory[];
}

/**
 * Get icon emoji for transaction category
 */
/**
 * Get category details (icon and label)
 */
function getCategoryDetails(
    categoryId: string,
    customCategories: CustomCategory[] = []
): { icon: any; label: string; isVectorIcon: boolean } {
    // Check custom categories first
    const customCat = customCategories.find((c) => c.id === categoryId);
    if (customCat) {
        return {
            icon: customCat.icon || "tag",
            label: customCat.name,
            isVectorIcon: true,
        };
    }

    // Fallback for legacy categories (mapping old enum values to icons/names)
    // We can also check if the categoryId itself is a valid icon name, but safer to map explicit legacy IDs
    switch (categoryId) {
        // Income
        case "salary":
            return { icon: "briefcase", label: "Salary", isVectorIcon: true };
        case "freelance":
            return { icon: "laptop", label: "Freelance", isVectorIcon: true };
        case "investment":
            return {
                icon: "chart-line",
                label: "Investment",
                isVectorIcon: true,
            };
        case "gift":
            return { icon: "gift", label: "Gift", isVectorIcon: true };
        case "refund":
            return { icon: "cash-refund", label: "Refund", isVectorIcon: true };
        case "other_income":
            return {
                icon: "dots-horizontal",
                label: "Other Income",
                isVectorIcon: true,
            };

        // Expense
        case "food":
            return { icon: "food", label: "Food", isVectorIcon: true };
        case "transport":
            return { icon: "car", label: "Transport", isVectorIcon: true };
        case "shopping":
            return { icon: "shopping", label: "Shopping", isVectorIcon: true };
        case "entertainment":
            return {
                icon: "movie",
                label: "Entertainment",
                isVectorIcon: true,
            };
        case "bills":
            return {
                icon: "file-document",
                label: "Bills",
                isVectorIcon: true,
            };
        case "healthcare":
            return {
                icon: "hospital",
                label: "Healthcare",
                isVectorIcon: true,
            };
        case "education":
            return { icon: "school", label: "Education", isVectorIcon: true };
        case "travel":
            return { icon: "airplane", label: "Travel", isVectorIcon: true };
        case "groceries":
            return { icon: "cart", label: "Groceries", isVectorIcon: true };
        case "utilities":
            return {
                icon: "lightning-bolt",
                label: "Utilities",
                isVectorIcon: true,
            };
        case "rent":
            return { icon: "home", label: "Rent", isVectorIcon: true };
        case "other_expense":
            return {
                icon: "cash-multiple",
                label: "Other Expense",
                isVectorIcon: true,
            };

        default:
            // Attempt to format the ID as a label if unknown
            return {
                icon: "tag",
                label:
                    categoryId.charAt(0).toUpperCase() +
                    categoryId.slice(1).replace(/_/g, " "),
                isVectorIcon: true,
            };
    }
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
        return "Today";
    } else if (diffDays === 1) {
        return "Yesterday";
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return transactionDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year:
                transactionDate.getFullYear() !== now.getFullYear()
                    ? "numeric"
                    : undefined,
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
    customCategories = [],
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const { icon, label, isVectorIcon } = getCategoryDetails(
        transaction.category,
        customCategories
    );

    const handlePress = () => {
        onPress?.(transaction);
    };

    const handleLongPress = () => {
        onLongPress?.(transaction);
    };

    const isCredit = transaction.type === TransactionType.CREDIT;

    return (
        <TouchableOpacity
            style={[styles.container, isSelected && styles.containerSelected]}
            onPress={handlePress}
            onLongPress={handleLongPress}
            activeOpacity={0.7}
            disabled={!onPress && !onLongPress}
        >
            <View style={styles.iconContainer}>
                {isVectorIcon ? (
                    <MaterialCommunityIcons
                        name={icon}
                        size={24}
                        color={colors.primary}
                    />
                ) : (
                    <Text style={styles.icon}>{icon}</Text>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {transaction.title}
                </Text>
                <View style={styles.metaContainer}>
                    <Text style={styles.category}>{label}</Text>
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
                    {isCredit ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            minHeight: 76,
        },
        containerSelected: {
            borderColor: colors.primary,
            borderWidth: 2,
            backgroundColor: `${colors.primary}08`,
        },
        iconContainer: {
            width: 52,
            height: 52,
            borderRadius: borderRadius.full,
            backgroundColor: colors.backgroundSecondary,
            alignItems: "center",
            justifyContent: "center",
            marginRight: spacing.md,
        },
        icon: {
            fontSize: 28,
        },
        content: {
            flex: 1,
            marginRight: spacing.md,
        },
        title: {
            ...typography.body.medium,
            color: colors.text,
            marginBottom: 4,
            fontSize: 16,
            fontWeight: typography.body.medium.fontWeight,
        },
        metaContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
        category: {
            ...typography.caption.medium,
            color: colors.textSecondary,
            fontSize: 14,
        },
        separator: {
            ...typography.caption.medium,
            color: colors.textTertiary,
            marginHorizontal: 6,
            fontSize: 14,
        },
        date: {
            ...typography.caption.medium,
            color: colors.textTertiary,
            fontSize: 14,
        },
        amountContainer: {
            alignItems: "flex-end",
        },
        amount: {
            ...typography.heading.h5,
            fontWeight: fontWeight.bold,
            fontSize: 18,
        },
        amountCredit: {
            color: colors.success,
        },
        amountDebit: {
            color: colors.danger,
        },
    });

export default TransactionItem;
