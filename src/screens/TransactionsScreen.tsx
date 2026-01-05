import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import TransactionItem from '../components/TransactionItem';
import { lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fontWeight, typography } from "../theme/typography";
import { Account } from "../types/Account";
import { Transaction, TransactionType } from "../types/Transaction";

import { useCurrency } from "../context/CurrencyContext";
import { storage } from "../utils/storage";

/**
 * Storage keys
 */
const STORAGE_KEYS = {
    ACCOUNTS: "accounts",
    TRANSACTIONS: "transactions",
};

/**
 * Filter type
 */
type FilterType = "all" | "credit" | "debit";

/**
 * Grouped transactions by date
 */
interface TransactionSection {
    title: string;
    data: Transaction[];
    totalCredit: number;
    totalDebit: number;
}

/**
 * Navigation prop type
 */
interface TransactionsScreenProps {
    navigation: {
        goBack: () => void;
        setOptions: (options: any) => void;
    };
    route: {
        params?: {
            accountId?: string;
        };
    };
}

/**
 * TransactionsScreen - Display and filter transactions
 */
export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
    navigation,
    route,
}) => {
    const accountId = route.params?.accountId;
    const { formatCurrency } = useCurrency();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>("all");

    /**
     * Load transactions and account from storage
     */
    const loadData = async () => {
        try {
            const [storedTransactions, storedAccounts] = await Promise.all([
                storage.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS),
                storage.getData<Account[]>(STORAGE_KEYS.ACCOUNTS),
            ]);

            // Parse dates
            const parsedTransactions = (storedTransactions || []).map((t) => ({
                ...t,
                date: new Date(t.date),
            }));

            setTransactions(parsedTransactions);

            // Find account if accountId is provided
            if (accountId && storedAccounts) {
                const foundAccount = storedAccounts.find(
                    (a) => a.id === accountId
                );
                setAccount(foundAccount || null);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            setTransactions([]);
            setAccount(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Initial load
     */
    useEffect(() => {
        loadData();
    }, [accountId]);

    /**
     * Update screen title with account name
     */
    useEffect(() => {
        if (account) {
            navigation.setOptions({
                title: account.name,
            });
        }
    }, [account, navigation]);

    /**
     * Reload data when screen comes into focus
     */
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [accountId])
    );

    /**
     * Handle pull-to-refresh
     */
    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    /**
     * Filter transactions by account and filter type
     */
    const getFilteredTransactions = (): Transaction[] => {
        let filtered = transactions;

        // Filter by account
        if (accountId) {
            filtered = filtered.filter((t) => t.accountId === accountId);
        }

        // Filter by type
        if (filter !== "all") {
            filtered = filtered.filter((t) => t.type === filter);
        }

        return filtered;
    };

    /**
     * Group transactions by month
     */
    const groupTransactionsByMonth = (
        transactions: Transaction[]
    ): TransactionSection[] => {
        // Sort by date (newest first)
        const sorted = [...transactions].sort(
            (a, b) => b.date.getTime() - a.date.getTime()
        );

        // Group by month
        const groups = new Map<string, Transaction[]>();

        sorted.forEach((transaction) => {
            const monthKey = getMonthKey(transaction.date);
            const existing = groups.get(monthKey) || [];
            groups.set(monthKey, [...existing, transaction]);
        });

        // Convert to sections
        const sections: TransactionSection[] = [];

        groups.forEach((transactions, monthKey) => {
            const totalCredit = transactions
                .filter((t) => t.type === TransactionType.CREDIT)
                .reduce((sum, t) => sum + t.amount, 0);

            const totalDebit = transactions
                .filter((t) => t.type === TransactionType.DEBIT)
                .reduce((sum, t) => sum + t.amount, 0);

            sections.push({
                title: monthKey,
                data: transactions,
                totalCredit,
                totalDebit,
            });
        });

        return sections;
    };

    /**
     * Get month key for grouping
     */
    const getMonthKey = (date: Date): string => {
        const now = new Date();
        const transactionDate = new Date(date);

        const isCurrentYear =
            transactionDate.getFullYear() === now.getFullYear();
        const isCurrentMonth =
            isCurrentYear && transactionDate.getMonth() === now.getMonth();

        if (isCurrentMonth) {
            return "This Month";
        }

        const monthName = transactionDate.toLocaleDateString("en-IN", {
            month: "long",
            year: isCurrentYear ? undefined : "numeric",
        });

        return monthName;
    };

    /**
     * Handle transaction press
     */
    const handleTransactionPress = (transaction: Transaction) => {
        // TODO: Navigate to transaction details or edit screen
        console.log("Transaction pressed:", transaction.id);
    };

    /**
     * Handle filter change
     */
    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
    };

    /**
     * Render filter buttons
     */
    const renderFilters = () => (
        <View style={styles.filterContainer}>
            <TouchableOpacity
                style={[
                    styles.filterButton,
                    filter === "all" && styles.filterButtonActive,
                ]}
                onPress={() => handleFilterChange("all")}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.filterButtonText,
                        filter === "all" && styles.filterButtonTextActive,
                    ]}
                >
                    All
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.filterButton,
                    filter === "credit" && styles.filterButtonActive,
                    filter === "credit" && styles.filterButtonCredit,
                ]}
                onPress={() => handleFilterChange("credit")}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.filterButtonText,
                        filter === "credit" && styles.filterButtonTextActive,
                    ]}
                >
                    Income
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.filterButton,
                    filter === "debit" && styles.filterButtonActive,
                    filter === "debit" && styles.filterButtonDebit,
                ]}
                onPress={() => handleFilterChange("debit")}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.filterButtonText,
                        filter === "debit" && styles.filterButtonTextActive,
                    ]}
                >
                    Expense
                </Text>
            </TouchableOpacity>
        </View>
    );

    /**
     * Render section header
     */
    const renderSectionHeader = ({
        section,
    }: {
        section: TransactionSection;
    }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionSummary}>
                {section.totalCredit > 0 && (
                    <Text style={styles.sectionCredit}>
                        +{formatCurrency(section.totalCredit)}
                    </Text>
                )}
                {section.totalDebit > 0 && (
                    <Text style={styles.sectionDebit}>
                        -{formatCurrency(section.totalDebit)}
                    </Text>
                )}
            </View>
        </View>
    );

    /**
     * Render transaction item
     */
    const renderTransactionItem = ({ item }: { item: Transaction }) => (
        <TransactionItem
            transaction={item}
            onPress={handleTransactionPress}
            showDate={false}
        />
    );

    /**
     * Render empty state
     */
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyDescription}>
                {filter === "all"
                    ? "No transactions found for this account"
                    : filter === "credit"
                    ? "No income transactions found"
                    : "No expense transactions found"}
            </Text>
        </View>
    );

    /**
     * Render loading state
     */
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={lightColors.primary}
                    />
                    <Text style={styles.loadingText}>
                        Loading transactions...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const filteredTransactions = getFilteredTransactions();
    const sections = groupTransactionsByMonth(filteredTransactions);

    return (
        <SafeAreaView style={styles.container}>
            {renderFilters()}
            <SectionList
                sections={sections}
                renderItem={renderTransactionItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={[
                    styles.listContent,
                    sections.length === 0 && styles.listContentEmpty,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[lightColors.primary]}
                        tintColor={lightColors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={true}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: lightColors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        ...typography.body.medium,
        color: lightColors.textSecondary,
        marginTop: spacing.md,
    },
    filterContainer: {
        flexDirection: "row",
        padding: spacing.md,
        gap: spacing.sm,
        backgroundColor: lightColors.background,
        borderBottomWidth: 1,
        borderBottomColor: lightColors.border,
    },
    filterButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: lightColors.backgroundSecondary,
        alignItems: "center",
        borderWidth: 1,
        borderColor: lightColors.border,
    },
    filterButtonActive: {
        backgroundColor: lightColors.primary,
        borderColor: lightColors.primary,
    },
    filterButtonCredit: {
        backgroundColor: lightColors.success,
        borderColor: lightColors.success,
    },
    filterButtonDebit: {
        backgroundColor: lightColors.danger,
        borderColor: lightColors.danger,
    },
    filterButtonText: {
        ...typography.body.small,
        color: lightColors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    filterButtonTextActive: {
        color: lightColors.white,
    },
    listContent: {
        padding: spacing.md,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        backgroundColor: lightColors.background,
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        ...typography.heading.h5,
        color: lightColors.text,
    },
    sectionSummary: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    sectionCredit: {
        ...typography.body.small,
        color: lightColors.success,
        fontWeight: fontWeight.semiBold,
    },
    sectionDebit: {
        ...typography.body.small,
        color: lightColors.danger,
        fontWeight: fontWeight.semiBold,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        ...typography.heading.h3,
        color: lightColors.text,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    emptyDescription: {
        ...typography.body.medium,
        color: lightColors.textSecondary,
        textAlign: "center",
    },
});

export default TransactionsScreen;
