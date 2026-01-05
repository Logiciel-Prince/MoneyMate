import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";
import { fontWeight } from "../theme/typography";
import { Goal } from "../types/Goal";
import { formatCurrency } from "../utils/currency";

export interface GoalCardProps {
    goal: Goal;
    onPress?: (goal: Goal) => void;
    onLongPress?: (goal: Goal) => void;
    isSelected?: boolean;
}

function calculateProgress(savedAmount: number, targetAmount: number): number {
    if (targetAmount === 0) return 0;
    const progress = (savedAmount / targetAmount) * 100;
    return Math.min(Math.max(progress, 0), 100);
}

const GoalCard: React.FC<GoalCardProps> = ({
    goal,
    onPress,
    onLongPress,
    isSelected = false,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const handlePress = () => onPress?.(goal);
    const handleLongPress = () => onLongPress?.(goal);

    const progress = calculateProgress(goal.savedAmount, goal.targetAmount);

    // Determine progress color
    let progressColor = colors.danger;
    if (progress >= 100) progressColor = colors.success;
    else if (progress >= 75) progressColor = "#3B82F6"; // Info/Blue
    else if (progress >= 50) progressColor = colors.warning;

    const remainingAmount = goal.targetAmount - goal.savedAmount;
    const isCompleted = progress >= 100;

    const iconName = isCompleted ? "trophy" : "target";

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isSelected && styles.containerSelected,
                isCompleted && styles.containerCompleted,
            ]}
            onPress={handlePress}
            onLongPress={handleLongPress}
            activeOpacity={0.7}
            disabled={!onPress && !onLongPress}
            delayLongPress={500}
        >
            <View style={styles.header}>
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: isCompleted
                                ? colors.success + "15"
                                : colors.primary + "15",
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={iconName}
                        size={24}
                        color={isCompleted ? colors.success : colors.primary}
                    />
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.goalName} numberOfLines={1}>
                        {goal.name}
                    </Text>
                    <Text style={styles.createdDate}>
                        Created {new Date(goal.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                {isCompleted && (
                    <View style={styles.completedBadge}>
                        <MaterialCommunityIcons
                            name="check"
                            size={16}
                            color="#fff"
                        />
                    </View>
                )}
            </View>

            <View style={styles.amountContainer}>
                <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Saved</Text>
                    <Text
                        style={[styles.amountValue, { color: progressColor }]}
                    >
                        {formatCurrency(goal.savedAmount)}
                    </Text>
                </View>
                <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Target</Text>
                    <Text style={styles.amountValue}>
                        {formatCurrency(goal.targetAmount)}
                    </Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text
                        style={[
                            styles.progressPercentage,
                            { color: progressColor },
                        ]}
                    >
                        {progress.toFixed(0)}%
                    </Text>
                </View>
                <View style={styles.progressBarBackground}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${progress}%`,
                                backgroundColor: progressColor,
                            },
                        ]}
                    />
                </View>
                {!isCompleted && (
                    <Text style={styles.remainingText}>
                        {formatCurrency(remainingAmount)} remaining
                    </Text>
                )}
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
            // Using shadow instead of border for cleaner look, but can add border if preferred.
            // Adding subtle border for contrast in dark mode
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        containerSelected: {
            borderColor: colors.primary,
            borderWidth: 2,
        },
        containerCompleted: {
            backgroundColor: colors.surface, // Keep surface but maybe add green border or tint?
            borderColor: colors.success,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.md,
        },
        iconContainer: {
            width: 44,
            height: 44,
            borderRadius: borderRadius.full,
            alignItems: "center",
            justifyContent: "center",
            marginRight: spacing.sm,
        },
        headerContent: {
            flex: 1,
        },
        goalName: {
            fontSize: 16,
            fontWeight: fontWeight.bold,
            color: colors.text,
            marginBottom: 2,
        },
        createdDate: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        completedBadge: {
            width: 24,
            height: 24,
            borderRadius: borderRadius.full,
            backgroundColor: colors.success,
            alignItems: "center",
            justifyContent: "center",
        },
        amountContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: spacing.md,
            paddingBottom: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        amountRow: {
            flex: 1,
        },
        amountLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        amountValue: {
            fontSize: 16,
            fontWeight: fontWeight.semiBold,
            color: colors.text,
        },
        progressContainer: {
            marginTop: spacing.xs,
        },
        progressHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.xs,
        },
        progressLabel: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        progressPercentage: {
            fontSize: 12,
            fontWeight: fontWeight.semiBold,
        },
        progressBarBackground: {
            height: 8,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: borderRadius.full,
            overflow: "hidden",
        },
        progressBarFill: {
            height: "100%",
            borderRadius: borderRadius.full,
        },
        remainingText: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: spacing.xs,
            textAlign: "center",
        },
    });

export default GoalCard;
