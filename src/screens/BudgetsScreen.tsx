import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AddBudgetModal } from '../components/AddBudgetModal';
import { BudgetListItem } from '../components/BudgetListItem';
import { BudgetOverviewCard } from '../components/BudgetOverviewCard';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { Budget } from '../types/Budget';
import { CustomCategory, DEFAULT_EXPENSE_CATEGORIES } from '../types/Category';
import { Transaction, TransactionType } from '../types/Transaction';
import { seedDataIfNeeded } from '../utils/seed';
import { storage } from '../utils/storage';

const STORAGE_KEYS = {
    BUDGETS: 'budgets',
    TRANSACTIONS: 'transactions',
    CATEGORIES: 'custom_categories',
};

// Mock Budgets if empty
const MOCK_BUDGETS: Budget[] = [
    {
        id: 'bdg-1',
        categoryId: 'food',
        limit: 2000,
        period: 'monthly',
    },
];

export const BudgetsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<CustomCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

    const loadData = async () => {
        try {
            await seedDataIfNeeded();

            const [storedBudgets, storedTransactions, storedCategories] = await Promise.all([
                storage.getData<Budget[]>(STORAGE_KEYS.BUDGETS),
                storage.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS),
                storage.getData<CustomCategory[]>(STORAGE_KEYS.CATEGORIES),
            ]);

            setTransactions(storedTransactions || []);
            
            // Deduplicate categories
            const categoryMap = new Map<string, CustomCategory>();
            DEFAULT_EXPENSE_CATEGORIES.forEach(c => categoryMap.set(c.id, c));
            if (storedCategories) {
                storedCategories.forEach(c => categoryMap.set(c.id, c));
            }
            const allCategories = Array.from(categoryMap.values());
            setCategories(allCategories);

            if (!storedBudgets || storedBudgets.length === 0) {
                setBudgets(MOCK_BUDGETS);
                await storage.saveData(STORAGE_KEYS.BUDGETS, MOCK_BUDGETS);
            } else {
                setBudgets(storedBudgets);
            }

        } catch (error) {
            console.error("Error loading budgets", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const handleAddBudget = () => {
        setSelectedBudget(null);
        setModalVisible(true);
    };

    const handleEditBudget = (budget: Budget) => {
        setSelectedBudget(budget);
        setModalVisible(true);
    };

    const handleSaveBudget = async (data: Omit<Budget, 'id'>) => {
        let updatedBudgets = [...budgets];
        if (selectedBudget) {
            updatedBudgets = updatedBudgets.map(b => b.id === selectedBudget.id ? { ...b, ...data } : b);
        } else {
            updatedBudgets.push({ id: `bdg-${Date.now()}`, ...data });
        }
        setBudgets(updatedBudgets);
        await storage.saveData(STORAGE_KEYS.BUDGETS, updatedBudgets);
    };

    const handleDeleteBudget = (id: string) => {
        Alert.alert(
            "Delete Budget",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        const newBudgets = budgets.filter(b => b.id !== id);
                        setBudgets(newBudgets);
                        await storage.saveData(STORAGE_KEYS.BUDGETS, newBudgets);
                        setModalVisible(false);
                    }
                }
            ]
        );
    };

    const calculateSpent = (categoryId: string, date: Date = new Date()) => {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return transactions
            .filter(t => 
                t.category === categoryId && 
                t.type === TransactionType.DEBIT &&
                new Date(t.date) >= startOfMonth &&
                new Date(t.date) <= endOfMonth
            )
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const getBudgetDetails = () => {
        let totalBudgeted = 0;
        let totalSpent = 0;

        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const detailedBudgets = budgets.map(b => {
            const category = categories.find(c => c.id === b.categoryId) || DEFAULT_EXPENSE_CATEGORIES.find(c=>c.id === b.categoryId) || {
                id: b.categoryId,
                name: 'Unknown',
                color: colors.textSecondary,
                icon: 'help'
            } as CustomCategory;

            const spent = calculateSpent(b.categoryId, now);
            const spentLast = calculateSpent(b.categoryId, lastMonth);
            
            let trend: number | null = null;
            if (spentLast > 0) {
                trend = ((spent - spentLast) / spentLast) * 100;
            }

            totalBudgeted += b.limit;
            totalSpent += spent;

            return {
                budget: b,
                category,
                spent,
                trend
            };
        });

        return { detailedBudgets, totalBudgeted, totalSpent };
    };

    const { detailedBudgets, totalBudgeted, totalSpent } = getBudgetDetails();
    const expenseCategories = categories.filter(c => c.type === 'expense');

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            activeOpacity={0.7} 
            onLongPress={() => handleEditBudget(item.budget)}
            delayLongPress={500}
        >
            <BudgetListItem 
                budget={item.budget} 
                category={item.category} 
                spent={item.spent} 
                onDelete={handleDeleteBudget}
                trend={item.trend}
            />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={detailedBudgets}
                renderItem={renderItem}
                keyExtractor={item => item.budget.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <BudgetOverviewCard 
                        totalBudgeted={totalBudgeted} 
                        totalSpent={totalSpent} 
                    />
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity 
                style={styles.fab}
                onPress={handleAddBudget}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#fff" />
            </TouchableOpacity>

            <AddBudgetModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveBudget}
                categories={expenseCategories}
                initialData={selectedBudget}
                onDelete={handleDeleteBudget}
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
        center: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        listContent: {
            padding: spacing.md,
            paddingBottom: 100,
        },
        fab: {
            position: "absolute",
            bottom: spacing.xl,
            right: spacing.lg,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#2563EB",
            justifyContent: "center",
            alignItems: "center",
            elevation: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
        },
    });

export default BudgetsScreen;
