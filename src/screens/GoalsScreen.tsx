import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
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
} from 'react-native';
import GoalCard from '../components/GoalCard';
import { lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Goal } from '../types/Goal';
import { formatCurrency } from '../utils/currency';
import { storage } from '../utils/storage';

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  GOALS: 'goals',
};

/**
 * Navigation prop type
 */
interface GoalsScreenProps {
  navigation: {
    setOptions: (options: any) => void;
  };
}

/**
 * GoalsScreen - Display and manage savings goals
 */
export const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addMoneyModalVisible, setAddMoneyModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Form states for new goal
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');

  // Form state for adding money
  const [amountToAdd, setAmountToAdd] = useState('');

  /**
   * Load goals from storage
   */
  const loadGoals = async () => {
    try {
      const storedGoals = await storage.getData<Goal[]>(STORAGE_KEYS.GOALS);

      // Parse dates
      const parsedGoals = (storedGoals || []).map((g) => ({
        ...g,
        createdAt: new Date(g.createdAt),
      }));

      // Sort by creation date (newest first)
      parsedGoals.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      setGoals(parsedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Save goals to storage
   */
  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      await storage.saveData(STORAGE_KEYS.GOALS, updatedGoals);
      setGoals(updatedGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
      Alert.alert('Error', 'Failed to save goals');
    }
  };

  /**
   * Initial load
   */
  useEffect(() => {
    loadGoals();
  }, []);

  /**
   * Reload data when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  /**
   * Handle add goal button press
   */
  const handleAddGoalPress = () => {
    setGoalName('');
    setTargetAmount('');
    setInitialAmount('');
    setModalVisible(true);
  };

  /**
   * Handle create goal
   */
  const handleCreateGoal = async () => {
    // Validate inputs
    if (!goalName.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }

    const initial = initialAmount ? parseFloat(initialAmount) : 0;
    if (isNaN(initial) || initial < 0) {
      Alert.alert('Error', 'Please enter a valid initial amount');
      return;
    }

    if (initial > target) {
      Alert.alert('Error', 'Initial amount cannot be greater than target');
      return;
    }

    // Create new goal
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      name: goalName.trim(),
      targetAmount: target,
      savedAmount: initial,
      createdAt: new Date(),
    };

    const updatedGoals = [newGoal, ...goals];
    await saveGoals(updatedGoals);

    setModalVisible(false);
    Alert.alert('Success', 'Goal created successfully!');
  };

  /**
   * Handle goal press - show add money modal
   */
  const handleGoalPress = (goal: Goal) => {
    setSelectedGoal(goal);
    setAmountToAdd('');
    setAddMoneyModalVisible(true);
  };

  /**
   * Handle add money to goal
   */
  const handleAddMoney = async () => {
    if (!selectedGoal) return;

    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
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

    await saveGoals(updatedGoals);
    setAddMoneyModalVisible(false);

    // Check if goal is completed
    const updatedGoal = updatedGoals.find((g) => g.id === selectedGoal.id);
    if (updatedGoal && updatedGoal.savedAmount >= updatedGoal.targetAmount) {
      Alert.alert(
        '🎉 Goal Completed!',
        `Congratulations! You've reached your goal: ${updatedGoal.name}`
      );
    } else {
      Alert.alert('Success', 'Amount added successfully!');
    }
  };

  /**
   * Handle long press - delete goal
   */
  const handleGoalLongPress = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedGoals = goals.filter((g) => g.id !== goal.id);
            await saveGoals(updatedGoals);
            Alert.alert('Success', 'Goal deleted');
          },
        },
      ]
    );
  };

  /**
   * Calculate total statistics
   */
  const getTotalStats = () => {
    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const completedGoals = goals.filter(
      (g) => g.savedAmount >= g.targetAmount
    ).length;

    return { totalSaved, totalTarget, completedGoals };
  };

  /**
   * Render goal item
   */
  const renderGoalItem = ({ item }: { item: Goal }) => (
    <GoalCard
      goal={item}
      onPress={handleGoalPress}
      onLongPress={handleGoalLongPress}
    />
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎯</Text>
      <Text style={styles.emptyTitle}>No Goals Yet</Text>
      <Text style={styles.emptyDescription}>
        Set your first savings goal and start tracking your progress
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddGoalPress}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+ Create Goal</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render header with statistics
   */
  const renderHeader = () => {
    const { totalSaved, totalTarget, completedGoals } = getTotalStats();

    return (
      <View style={styles.header}>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Saved</Text>
              <Text style={styles.statValue}>
                {formatCurrency(totalSaved)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Target</Text>
              <Text style={styles.statValue}>
                {formatCurrency(totalTarget)}
              </Text>
            </View>
          </View>
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>
              {completedGoals} of {goals.length} goals completed
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          {goals.length > 0 && (
            <TouchableOpacity onPress={handleAddGoalPress} activeOpacity={0.7}>
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
          <ActivityIndicator size="large" color={lightColors.primary} />
          <Text style={styles.loadingText}>Loading goals...</Text>
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
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          goals.length === 0 && styles.listContentEmpty,
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

      {/* Add Goal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Goal</Text>

            <Text style={styles.inputLabel}>Goal Name</Text>
            <TextInput
              style={styles.input}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="e.g., Emergency Fund"
              placeholderTextColor={lightColors.textTertiary}
            />

            <Text style={styles.inputLabel}>Target Amount</Text>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="e.g., 100000"
              keyboardType="numeric"
              placeholderTextColor={lightColors.textTertiary}
            />

            <Text style={styles.inputLabel}>Initial Amount (Optional)</Text>
            <TextInput
              style={styles.input}
              value={initialAmount}
              onChangeText={setInitialAmount}
              placeholder="e.g., 5000"
              keyboardType="numeric"
              placeholderTextColor={lightColors.textTertiary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreateGoal}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Money Modal */}
      <Modal
        visible={addMoneyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddMoneyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Money to {selectedGoal?.name}
            </Text>

            <Text style={styles.inputLabel}>Amount to Add</Text>
            <TextInput
              style={styles.input}
              value={amountToAdd}
              onChangeText={setAmountToAdd}
              placeholder="e.g., 1000"
              keyboardType="numeric"
              placeholderTextColor={lightColors.textTertiary}
              autoFocus
            />

            {selectedGoal && (
              <View style={styles.goalInfo}>
                <Text style={styles.goalInfoText}>
                  Current: {formatCurrency(selectedGoal.savedAmount)}
                </Text>
                <Text style={styles.goalInfoText}>
                  Target: {formatCurrency(selectedGoal.targetAmount)}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setAddMoneyModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleAddMoney}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Add Money</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  statsCard: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: lightColors.border,
    shadowColor: lightColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: lightColors.border,
    marginHorizontal: spacing.md,
  },
  statLabel: {
    ...typography.caption.medium,
    color: lightColors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.heading.h4,
    color: lightColors.primary,
  },
  completedContainer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: lightColors.borderLight,
    alignItems: 'center',
  },
  completedText: {
    ...typography.body.small,
    color: lightColors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading.h4,
    color: lightColors.text,
  },
  addLink: {
    ...typography.body.medium,
    color: lightColors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body.medium,
    color: lightColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: lightColors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: lightColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    ...typography.button.medium,
    color: lightColors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: lightColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.heading.h3,
    color: lightColors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputLabel: {
    ...typography.body.medium,
    color: lightColors.text,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  input: {
    ...typography.body.medium,
    backgroundColor: lightColors.backgroundSecondary,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    color: lightColors.text,
  },
  goalInfo: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  goalInfoText: {
    ...typography.body.small,
    color: lightColors.textSecondary,
    marginBottom: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: lightColors.backgroundSecondary,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  modalButtonCreate: {
    backgroundColor: lightColors.primary,
  },
  modalButtonText: {
    ...typography.button.medium,
    color: lightColors.white,
  },
  modalButtonTextCancel: {
    ...typography.button.medium,
    color: lightColors.text,
  },
});

export default GoalsScreen;
