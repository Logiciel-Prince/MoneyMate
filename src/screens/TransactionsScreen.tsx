import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AddTransactionModal } from "../components/AddTransactionModal";
import { AnimatedFAB } from "../components/AnimatedFAB";
import { EmptyState } from "../components/EmptyState";
import { TransactionItem } from "../components/TransactionItem";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";
import { fontWeight, typography } from "../theme/typography";
import { Account } from "../types/Account";
import { CustomCategory, getAllDefaultCategories } from "../types/Category";
import { Transaction, TransactionType } from "../types/Transaction";
import { storage } from "../utils/storage";

/**
 * Storage keys
 */
const STORAGE_KEYS = {
    ACCOUNTS: "accounts",
    TRANSACTIONS: "transactions",
    CATEGORIES: "custom_categories",
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
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
        []
    );

    /**
     * Load transactions and account from storage
     */
    const loadData = async () => {
        try {
            const [storedTransactions, storedAccounts, storedCategories] =
                await Promise.all([
                    storage.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS),
                    storage.getData<Account[]>(STORAGE_KEYS.ACCOUNTS),
                    storage.getData<CustomCategory[]>(STORAGE_KEYS.CATEGORIES),
                ]);

            // Set categories (with default fallback)
            if (storedCategories && storedCategories.length > 0) {
                setCustomCategories(storedCategories);
            } else {
                setCustomCategories(getAllDefaultCategories());
            }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId]); // Reload when accountId changes

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
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [accountId]) // Reload when screen comes into focus or accountId changes
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
     * Handle save transaction
     */
    const handleSaveTransaction = async (transaction: Transaction) => {
        try {
            // Load existing transactions
            const allTransactions =
                (await storage.getData<Transaction[]>(
                    STORAGE_KEYS.TRANSACTIONS
                )) || [];

            // Add new transaction
            const updatedTransactions = [transaction, ...allTransactions];

            // Save to storage
            await storage.saveData(
                STORAGE_KEYS.TRANSACTIONS,
                updatedTransactions
            );

            // Reload transactions
            await loadData();
        } catch (error) {
            console.error("Error saving transaction:", error);
        }
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
                <MaterialCommunityIcons
                    name="view-list"
                    size={16}
                    color={
                        filter === "all" ? colors.white : colors.textSecondary
                    }
                />
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
                <MaterialCommunityIcons
                    name="arrow-down-circle"
                    size={16}
                    color={filter === "credit" ? colors.white : colors.success}
                />
                <Text
                    style={[
                        styles.filterButtonText,
                        filter === "credit" && styles.filterButtonTextActive,
                        filter !== "credit" && styles.filterButtonTextCredit,
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
                <MaterialCommunityIcons
                    name="arrow-up-circle"
                    size={16}
                    color={filter === "debit" ? colors.white : colors.danger}
                />
                <Text
                    style={[
                        styles.filterButtonText,
                        filter === "debit" && styles.filterButtonTextActive,
                        filter !== "debit" && styles.filterButtonTextDebit,
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
            customCategories={customCategories}
        />
    );

    /**
     * Render empty state
     */
    /**
     * Render empty state
     */
    const renderEmptyState = () => (
        <EmptyState
            title="No Transactions"
            description={
                filter === "all"
                    ? "No transactions found"
                    : filter === "credit"
                    ? "No income transactions found"
                    : "No expense transactions found"
            }
            icon="bank-transfer"
            onAction={() => setShowAddModal(true)}
            actionLabel="Add Transaction"
        />
    );

    /**
     * Render loading state
     */
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
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
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={true}
            />

            {/* Floating Action Button */}
            <AnimatedFAB
                onPress={() => setShowAddModal(true)}
                backgroundColor={colors.primary}
                delay={200}
                style={styles.fabPosition}
            />

            {/* Add Transaction Modal */}
            <AddTransactionModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleSaveTransaction}
            />
        </SafeAreaView>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: spacing.md,
        },
        loadingText: {
            ...typography.body.medium,
            color: colors.textSecondary,
            marginTop: spacing.md,
            fontSize: 16,
        },
        filterContainer: {
            flexDirection: "row",
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            gap: spacing.sm,
            backgroundColor: colors.background,
        },
        filterButton: {
            flex: 1,
            flexDirection: "row",
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.xs + 2,
            borderRadius: borderRadius.full,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: colors.border,
            minHeight: 40,
            gap: 4,
        },
        filterButtonActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            elevation: 2,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        filterButtonCredit: {
            backgroundColor: colors.success,
            borderColor: colors.success,
            elevation: 2,
            shadowColor: colors.success,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        filterButtonDebit: {
            backgroundColor: colors.danger,
            borderColor: colors.danger,
            elevation: 2,
            shadowColor: colors.danger,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        filterButtonText: {
            ...typography.body.small,
            color: colors.textSecondary,
            fontWeight: fontWeight.semiBold,
            fontSize: 12,
            flexShrink: 1,
        },
        filterButtonTextActive: {
            color: colors.white,
            fontWeight: fontWeight.bold,
        },
        filterButtonTextCredit: {
            color: colors.success,
        },
        filterButtonTextDebit: {
            color: colors.danger,
        },
        listContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: spacing.xxl,
        },
        listContentEmpty: {
            flexGrow: 1,
        },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.sm,
            backgroundColor: colors.background,
            marginBottom: spacing.md,
        },
        sectionTitle: {
            ...typography.heading.h5,
            color: colors.text,
            fontSize: 18,
            fontWeight: fontWeight.bold,
        },
        sectionSummary: {
            flexDirection: "row",
            gap: spacing.md,
            alignItems: "center",
        },
        sectionCredit: {
            ...typography.body.small,
            color: colors.success,
            fontWeight: fontWeight.bold,
            fontSize: 15,
        },
        sectionDebit: {
            ...typography.body.small,
            color: colors.danger,
            fontWeight: fontWeight.bold,
            fontSize: 15,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xxl * 2,
        },
        emptyIcon: {
            fontSize: 80,
            marginBottom: spacing.lg,
        },
        emptyTitle: {
            ...typography.heading.h3,
            color: colors.text,
            marginBottom: spacing.md,
            textAlign: "center",
            fontSize: 24,
            fontWeight: fontWeight.bold,
        },
        emptyDescription: {
            ...typography.body.medium,
            color: colors.textSecondary,
            textAlign: "center",
            fontSize: 16,
            lineHeight: 24,
        },
        fabPosition: {
            position: "absolute",
            right: spacing.lg,
            bottom: spacing.xl,
        },
    });

export default TransactionsScreen;
