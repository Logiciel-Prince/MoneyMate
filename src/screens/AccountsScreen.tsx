import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import AccountCard from "../components/AccountCard";
import { AddAccountModal } from "../components/AddAccountModal";
import AnimatedCard from "../components/AnimatedCard";
import AnimatedFAB from "../components/AnimatedFAB";
import { EmptyState } from "../components/EmptyState";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { Account } from "../types/Account";
import { Transaction } from "../types/Transaction";
import { formatCurrency } from "../utils/currency";
import { seedDataIfNeeded } from "../utils/seed";
import { storage } from "../utils/storage";

/**
 * Storage keys
 */
const STORAGE_KEYS = {
    ACCOUNTS: "accounts",
    TRANSACTIONS: "transactions",
};

/**
 * Navigation prop type
 */
interface AccountsScreenProps {
    navigation: {
        navigate: (screen: string, params?: any) => void;
    };
}

/**
 * AccountsScreen - Home screen displaying all accounts
 */
export const AccountsScreen: React.FC<AccountsScreenProps> = ({
    navigation,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(
        null
    );

    /**
     * Load accounts and transactions from storage
     */
    const loadData = async () => {
        try {
            const [storedAccounts, storedTransactions] = await Promise.all([
                storage.getData<Account[]>(STORAGE_KEYS.ACCOUNTS),
                storage.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS),
            ]);

            setAccounts(storedAccounts || []);
            setTransactions(storedTransactions || []);
        } catch (error) {
            console.error("Error loading data:", error);
            setAccounts([]);
            setTransactions([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Initial load - seed data if needed, then load
     */
    useEffect(() => {
        const initializeData = async () => {
            await seedDataIfNeeded();
            await loadData();
        };
        initializeData();
    }, []); // Only run on mount

    /**
     * Reload data when screen comes into focus
     */
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, []) // Reload when screen comes into focus
    );

    /**
     * Handle pull-to-refresh
     */
    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    /**
     * Calculate account balance from transactions
     */
    const calculateAccountBalance = (account: Account): number => {
        const accountTransactions = transactions.filter(
            (t) => t.accountId === account.id
        );

        // Start with initial balance (account.balance)
        return accountTransactions.reduce((balance, transaction) => {
            if (transaction.type === "credit") {
                return balance + transaction.amount;
            } else {
                return balance - transaction.amount;
            }
        }, account.balance);
    };

    /**
     * Get accounts with updated balances
     */
    const getAccountsWithBalances = (): Account[] => {
        return accounts.map((account) => ({
            ...account,
            balance: calculateAccountBalance(account),
        }));
    };

    /**
     * Calculate total balance across all accounts
     */
    const calculateTotalBalance = (): number => {
        const accountsWithBalances = getAccountsWithBalances();
        return accountsWithBalances.reduce(
            (total, account) => total + account.balance,
            0
        );
    };

    /**
     * Handle account press - Disabled as per request
     */
    const handleAccountPress = (account: Account) => {
        // navigation.navigate("Transactions", { accountId: account.id });
    };

    /**
     * Handle account long press - Edit account
     */
    const handleAccountLongPress = (account: Account) => {
        setSelectedAccount(account);
        setModalVisible(true);
    };

    /**
     * Handle add account press
     */
    const handleAddAccount = () => {
        setSelectedAccount(null);
        setModalVisible(true);
    };

    /**
     * Handle save account (Add or Edit)
     */
    const handleSaveAccount = async (data: Omit<Account, "id">) => {
        let updatedAccounts = [...accounts];

        if (selectedAccount) {
            // Edit existing
            updatedAccounts = updatedAccounts.map((acc) =>
                acc.id === selectedAccount.id ? { ...acc, ...data } : acc
            );
        } else {
            // Add new
            const newAccount: Account = {
                id: `acc-${Date.now()}`,
                ...data,
            };
            updatedAccounts.push(newAccount);
        }

        try {
            await storage.saveData(STORAGE_KEYS.ACCOUNTS, updatedAccounts);
            setAccounts(updatedAccounts);
            // Optionally refresh to ensure balances update if logic requires
        } catch (error) {
            console.error("Error saving account:", error);
            Alert.alert("Error", "Failed to save account");
        }
    };

    /**
     * Handle delete account
     */
    const handleDeleteAccount = (id: string) => {
        Alert.alert(
            "Delete Account",
            "Are you sure? This will delete the account and all its transactions.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updatedAccounts = accounts.filter(
                                (a) => a.id !== id
                            );
                            const updatedTransactions = transactions.filter(
                                (t) => t.accountId !== id
                            );

                            await Promise.all([
                                storage.saveData(
                                    STORAGE_KEYS.ACCOUNTS,
                                    updatedAccounts
                                ),
                                storage.saveData(
                                    STORAGE_KEYS.TRANSACTIONS,
                                    updatedTransactions
                                ),
                            ]);

                            setAccounts(updatedAccounts);
                            setTransactions(updatedTransactions);
                            setModalVisible(false);
                            Alert.alert("Success", "Account deleted");
                        } catch (error) {
                            console.error("Error deleting account:", error);
                            Alert.alert("Error", "Failed to delete account");
                        }
                    },
                },
            ]
        );
    };

    /**
     * Render account item
     */
    const renderAccountItem = ({ item }: { item: Account }) => {
        const accountWithBalance = {
            ...item,
            balance: calculateAccountBalance(item),
        };

        return (
            <AccountCard
                account={accountWithBalance}
                onPress={handleAccountPress}
                onLongPress={handleAccountLongPress}
            />
        );
    };

    /**
     * Render empty state
     */
    const renderEmptyState = () => (
        <EmptyState
            title="No Accounts Yet"
            description="Add your first account to start tracking your finances"
            icon="wallet-plus"
            onAction={handleAddAccount}
            actionLabel="Add Account"
        />
    );

    /**
     * Render header with total balance
     */
    const renderHeader = () => {
        const totalBalance = calculateTotalBalance();
        const isNegative = totalBalance < 0;

        return (
            <View style={styles.header}>
                <AnimatedCard delay={100} style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text
                        style={[
                            styles.balanceAmount,
                            isNegative && styles.balanceNegative,
                        ]}
                    >
                        {formatCurrency(totalBalance)}
                    </Text>
                    <Text style={styles.accountCount}>
                        {accounts.length}{" "}
                        {accounts.length === 1 ? "Account" : "Accounts"}
                    </Text>
                </AnimatedCard>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Accounts</Text>
                    {/* Removed + Add link */}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading accounts...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={accounts}
                renderItem={renderAccountItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={[
                    styles.listContent,
                    accounts.length === 0 && styles.listContentEmpty,
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
            />

            {/* FAB */}
            <AnimatedFAB
                onPress={handleAddAccount}
                backgroundColor={colors.primary}
                delay={300}
                style={styles.fabPosition}
            />

            <AddAccountModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveAccount}
                initialData={selectedAccount}
                onDelete={handleDeleteAccount}
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
        },
        loadingText: {
            ...typography.body.medium,
            color: colors.textSecondary,
            marginTop: spacing.md,
        },
        listContent: {
            padding: spacing.md,
            paddingBottom: 80, // Add padding for FAB
        },
        listContentEmpty: {
            flexGrow: 1,
        },
        header: {
            marginBottom: spacing.md,
        },
        balanceCard: {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        balanceLabel: {
            ...typography.body.medium,
            color: colors.white,
            opacity: 0.9,
            marginBottom: spacing.xs,
        },
        balanceAmount: {
            ...typography.heading.h1,
            color: colors.white,
            marginBottom: spacing.xs,
        },
        balanceNegative: {
            color: colors.dangerLight || colors.danger,
        },
        accountCount: {
            ...typography.caption.medium,
            color: colors.white,
            opacity: 0.8,
        },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.sm,
            marginTop: spacing.md,
        },
        sectionTitle: {
            ...typography.heading.h4,
            color: colors.text,
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
            color: colors.text,
        },
        emptyTitle: {
            ...typography.heading.h3,
            color: colors.text,
            marginBottom: spacing.sm,
            textAlign: "center",
        },
        emptyDescription: {
            ...typography.body.medium,
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: spacing.lg,
        },
        addButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.md,
            shadowColor: colors.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        addButtonText: {
            ...typography.button.medium,
            color: colors.white,
        },
        fabPosition: {
            position: "absolute",
            bottom: spacing.xl,
            right: spacing.lg,
            zIndex: 100,
        },
    });

export default AccountsScreen;
