import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AddGoalModal } from "../components/AddGoalModal";
import GoalCard from "../components/GoalCard";
import { GoalsOverviewCard } from "../components/GoalsOverviewCard";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";
import { fontWeight } from "../theme/typography";
import { Goal } from "../types/Goal";
import { storage } from "../utils/storage";

const STORAGE_KEYS = {
    GOALS: "goals",
};

export const GoalsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modals
    const [isAddGoalModalVisible, setIsAddGoalModalVisible] = useState(false);
    const [isAddMoneyModalVisible, setIsAddMoneyModalVisible] = useState(false);

    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [amountToAdd, setAmountToAdd] = useState("");

    const loadGoals = async () => {
        try {
            const storedGoals = await storage.getData<Goal[]>(
                STORAGE_KEYS.GOALS
            );
            const parsedGoals = (storedGoals || []).map((g) => ({
                ...g,
                createdAt: new Date(g.createdAt),
            }));
            parsedGoals.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
            setGoals(parsedGoals);
        } catch (error) {
            console.error("Error loading goals:", error);
            setGoals([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadGoals();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadGoals();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadGoals();
    };

    const handleAddGoalPress = () => {
        setSelectedGoal(null);
        setIsAddGoalModalVisible(true);
    };

    const handleGoalPress = (goal: Goal) => {
        setSelectedGoal(goal);
        setAmountToAdd("");
        setIsAddMoneyModalVisible(true);
    };

    const handleGoalLongPress = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsAddGoalModalVisible(true); // Edit Mode
    };

    const handleSaveGoal = async (data: Partial<Goal>) => {
        let updatedGoals = [...goals];

        if (selectedGoal) {
            // Edit existing
            updatedGoals = updatedGoals.map((g) =>
                g.id === selectedGoal.id ? { ...g, ...data } : g
            );
        } else {
            // Create new
            const newGoal: Goal = {
                id: `goal-${Date.now()}`,
                name: data.name || "New Goal",
                targetAmount: data.targetAmount || 0,
                savedAmount: data.savedAmount || 0, // Initial amount
                createdAt: new Date(),
            };
            updatedGoals = [newGoal, ...updatedGoals];
        }

        await storage.saveData(STORAGE_KEYS.GOALS, updatedGoals);
        setGoals(updatedGoals);
        Alert.alert("Success", selectedGoal ? "Goal updated" : "Goal created");
    };

    const handleDeleteGoal = async (id: string) => {
        Alert.alert("Delete Goal", `Are you sure?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const updatedGoals = goals.filter((g) => g.id !== id);
                    await storage.saveData(STORAGE_KEYS.GOALS, updatedGoals);
                    setGoals(updatedGoals);
                },
            },
        ]);
    };

    const handleAddMoney = async () => {
        if (!selectedGoal) return;
        const amount = parseFloat(amountToAdd);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        const updatedGoals = goals.map((g) => {
            if (g.id === selectedGoal.id) {
                return {
                    ...g,
                    savedAmount: g.savedAmount + amount,
                };
            }
            return g;
        });

        await storage.saveData(STORAGE_KEYS.GOALS, updatedGoals);
        setGoals(updatedGoals);
        setIsAddMoneyModalVisible(false);

        // Success feedback
        const updatedGoal = updatedGoals.find((g) => g.id === selectedGoal.id);
        if (
            updatedGoal &&
            updatedGoal.savedAmount >= updatedGoal.targetAmount
        ) {
            Alert.alert(
                "🎉 Goal Reached!",
                `You've reached your goal: ${updatedGoal.name}`
            );
        } else {
            Alert.alert("Success", "Amount added!");
        }
    };

    const getTotalStats = () => {
        const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
        const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const completedGoals = goals.filter(
            (g) => g.savedAmount >= g.targetAmount
        ).length;
        return { totalSaved, totalTarget, completedGoals };
    };

    const renderGoalItem = ({ item }: { item: Goal }) => (
        <GoalCard
            goal={item}
            onPress={handleGoalPress}
            onLongPress={handleGoalLongPress}
        />
    );

    const renderHeader = () => {
        const { totalSaved, totalTarget, completedGoals } = getTotalStats();
        return (
            <View style={styles.header}>
                <GoalsOverviewCard
                    totalSaved={totalSaved}
                    totalTarget={totalTarget}
                    completedCount={completedGoals}
                    totalCount={goals.length}
                />

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Goals</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={goals}
                renderItem={renderGoalItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddGoalPress}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#fff" />
            </TouchableOpacity>

            <AddGoalModal
                visible={isAddGoalModalVisible}
                onClose={() => setIsAddGoalModalVisible(false)}
                onSave={handleSaveGoal}
                initialData={selectedGoal}
                onDelete={handleDeleteGoal}
            />

            {/* Add Money Modal (Inline but styled) */}
            <Modal
                visible={isAddMoneyModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsAddMoneyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.addMoneyContent}>
                        <Text style={styles.modalTitle}>Add Money</Text>
                        <Text style={styles.modalSubtitle}>
                            {selectedGoal?.name}
                        </Text>

                        <Text style={styles.inputLabel}>Amount to Add</Text>
                        <TextInput
                            style={styles.input}
                            value={amountToAdd}
                            onChangeText={setAmountToAdd}
                            placeholder="0.00"
                            keyboardType="numeric"
                            placeholderTextColor={colors.textTertiary}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalButtonCancel,
                                ]}
                                onPress={() => setIsAddMoneyModalVisible(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalButtonCreate,
                                ]}
                                onPress={handleAddMoney}
                            >
                                <Text style={styles.modalButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        listContent: {
            padding: spacing.md,
            paddingBottom: 100,
        },
        header: {
            marginBottom: spacing.md,
        },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.sm,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: fontWeight.bold,
            color: colors.text,
        },
        fab: {
            position: "absolute",
            bottom: spacing.xl,
            right: spacing.xl,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            elevation: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.md,
        },
        addMoneyContent: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            width: "100%",
            maxWidth: 320,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: fontWeight.bold,
            color: colors.text,
            textAlign: "center",
            marginBottom: 4,
        },
        modalSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: spacing.lg,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: fontWeight.medium,
            color: colors.text,
            marginBottom: spacing.xs,
        },
        input: {
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            color: colors.text,
            fontSize: 16,
        },
        modalButtons: {
            flexDirection: "row",
            gap: spacing.sm,
            marginTop: spacing.md,
        },
        modalButton: {
            flex: 1,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.md,
            alignItems: "center",
        },
        modalButtonCancel: {
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        modalButtonCreate: {
            backgroundColor: colors.primary,
        },
        modalButtonText: {
            color: "#fff",
            fontWeight: fontWeight.bold,
        },
        modalButtonTextCancel: {
            color: colors.text,
            fontWeight: fontWeight.medium,
        },
    });

export default GoalsScreen;
