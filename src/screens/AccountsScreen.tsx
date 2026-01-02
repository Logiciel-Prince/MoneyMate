import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AccountCard from '../components/AccountCard';
import { lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { fontWeight, typography } from "../theme/typography";
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
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
    }, []);

    /**
     * Reload data when screen comes into focus
     */
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
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
    const calculateAccountBalance = (accountId: string): number => {
        const accountTransactions = transactions.filter(
            (t) => t.accountId === accountId
        );

        return accountTransactions.reduce((balance, transaction) => {
            if (transaction.type === "credit") {
                return balance + transaction.amount;
            } else {
                return balance - transaction.amount;
            }
        }, 0);
    };

    /**
     * Get accounts with updated balances
     */
    const getAccountsWithBalances = (): Account[] => {
        return accounts.map((account) => ({
            ...account,
            balance: calculateAccountBalance(account.id),
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
     * Handle account press - navigate to transactions screen
     */
    const handleAccountPress = (account: Account) => {
        navigation.navigate("Transactions", { accountId: account.id });
    };

    /**
     * Handle add account press
     */
    const handleAddAccount = () => {
        // TODO: Navigate to add account screen or show modal
        console.log("Add account pressed");
    };

    /**
     * Render account item
     */
    const renderAccountItem = ({ item }: { item: Account }) => {
        const accountWithBalance = {
            ...item,
            balance: calculateAccountBalance(item.id),
        };

        return (
            <AccountCard
                account={accountWithBalance}
                onPress={handleAccountPress}
            />
        );
    };

    /**
     * Render empty state
     */
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No Accounts Yet</Text>
            <Text style={styles.emptyDescription}>
                Add your first account to start tracking your finances
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAccount}
                activeOpacity={0.7}
            >
                <Text style={styles.addButtonText}>+ Add Account</Text>
            </TouchableOpacity>
        </View>
    );

    /**
     * Render header with total balance
     */
    const renderHeader = () => {
        const totalBalance = calculateTotalBalance();
        const isNegative = totalBalance < 0;

        return (
            <View style={styles.header}>
                <View style={styles.balanceCard}>
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
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Accounts</Text>
                    {accounts.length > 0 && (
                        <TouchableOpacity
                            onPress={handleAddAccount}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.addLink}>+ Add</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

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
                        colors={[lightColors.primary]}
                        tintColor={lightColors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
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
    listContent: {
        padding: spacing.md,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    header: {
        marginBottom: spacing.md,
    },
    balanceCard: {
        backgroundColor: lightColors.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        shadowColor: lightColors.black,
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
        color: lightColors.white,
        opacity: 0.9,
        marginBottom: spacing.xs,
    },
    balanceAmount: {
        ...typography.heading.h1,
        color: lightColors.white,
        marginBottom: spacing.xs,
    },
    balanceNegative: {
        color: lightColors.dangerLight,
    },
    accountCount: {
        ...typography.caption.medium,
        color: lightColors.white,
        opacity: 0.8,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        ...typography.heading.h4,
        color: lightColors.text,
    },
    addLink: {
        ...typography.body.medium,
        color: lightColors.primary,
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
        marginBottom: spacing.lg,
    },
    addButton: {
        backgroundColor: lightColors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        shadowColor: lightColors.black,
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
        color: lightColors.white,
    },
});

export default AccountsScreen;
