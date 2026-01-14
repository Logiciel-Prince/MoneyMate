import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";
import { fontWeight, typography } from "../theme/typography";
import { Budget } from "../types/Budget";
import { CustomCategory } from "../types/Category";
import { Dropdown } from "./Dropdown";

interface AddBudgetModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: Omit<Budget, "id">) => void;
    categories: CustomCategory[];
    initialData?: Budget | null;
    onDelete?: (id: string) => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
    visible,
    onClose,
    onSave,
    categories,
    initialData,
    onDelete,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [amount, setAmount] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [period, setPeriod] = useState<"monthly" | "weekly" | "yearly">(
        "monthly"
    );

    // Focus states for better UX
    const [focusedField, setFocusedField] = useState<string | null>(null);

    React.useEffect(() => {
        if (visible) {
            if (initialData) {
                setAmount(initialData.limit.toString());
                setSelectedCategoryId(initialData.categoryId);
                setPeriod(initialData.period);
            } else {
                setAmount("");
                setSelectedCategoryId("");
                setPeriod("monthly");
            }
        }
    }, [visible, initialData]);

    const handleSave = () => {
        const limit = parseFloat(amount);

        if (!amount || isNaN(limit) || limit <= 0) {
            Alert.alert(
                "Validation Error",
                "Please enter a valid budget amount greater than 0",
                [{ text: "OK" }]
            );
            return;
        }

        if (!selectedCategoryId) {
            Alert.alert(
                "Validation Error",
                "Please select a category for this budget",
                [{ text: "OK" }]
            );
            return;
        }

        onSave({
            limit,
            categoryId: selectedCategoryId,
            period,
        });
        onClose();
    };

    const handleDelete = () => {
        if (initialData && onDelete) {
            onDelete(initialData.id);
            onClose();
        }
    };

    // Filter expense categories only
    const expenseCategories = categories.filter(
        (cat) => cat.type === "expense"
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerContent}>
                                <MaterialCommunityIcons
                                    name="chart-box"
                                    size={28}
                                    color={colors.primary}
                                />
                                <Text style={styles.title}>
                                    {initialData ? "Edit Budget" : "Set Budget"}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                            >
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                        >
                            {/* Category */}
                            <View style={styles.section}>
                                <Dropdown
                                    label="Category *"
                                    placeholder="Select category"
                                    value={selectedCategoryId}
                                    options={expenseCategories.map((cat) => ({
                                        label: cat.name,
                                        value: cat.id,
                                        icon: cat.icon || "tag",
                                        color: cat.color,
                                    }))}
                                    onSelect={(value: string) =>
                                        setSelectedCategoryId(value)
                                    }
                                />
                            </View>

                            {/* Budget Limit */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Budget Limit *</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedField === "amount" &&
                                            styles.inputFocused,
                                    ]}
                                    value={amount}
                                    onChangeText={(text) => {
                                        // Remove any non-numeric characters except decimal point
                                        const cleaned = text.replace(
                                            /[^0-9.]/g,
                                            ""
                                        );

                                        // Ensure only one decimal point
                                        const parts = cleaned.split(".");
                                        if (parts.length > 2) return;

                                        // Limit decimal places to 2
                                        if (
                                            parts.length === 2 &&
                                            parts[1].length > 2
                                        )
                                            return;

                                        setAmount(cleaned);
                                    }}
                                    onFocus={() => setFocusedField("amount")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>

                            {/* Period */}
                            <View style={styles.section}>
                                <Dropdown
                                    label="Period"
                                    placeholder="Select period"
                                    value={period}
                                    options={[
                                        {
                                            label: "Monthly",
                                            value: "monthly",
                                            icon: "calendar-month",
                                        },
                                        {
                                            label: "Weekly",
                                            value: "weekly",
                                            icon: "calendar-week",
                                        },
                                        {
                                            label: "Yearly",
                                            value: "yearly",
                                            icon: "calendar",
                                        },
                                    ]}
                                    onSelect={(value: string) =>
                                        setPeriod(
                                            value as
                                                | "monthly"
                                                | "weekly"
                                                | "yearly"
                                        )
                                    }
                                />
                            </View>
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View style={styles.buttonContainer}>
                            {initialData && onDelete && (
                                <TouchableOpacity
                                    style={[styles.button, styles.deleteButton]}
                                    onPress={handleDelete}
                                >
                                    <MaterialCommunityIcons
                                        name="delete"
                                        size={20}
                                        color={colors.white}
                                    />
                                    <Text style={styles.deleteButtonText}>
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: "flex-end",
        },
        keyboardView: {
            width: "100%",
        },
        modalContainer: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            maxHeight: "95%",
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerContent: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
        },
        title: {
            ...typography.heading.h3,
            color: colors.text,
            fontWeight: fontWeight.bold,
            fontSize: 22,
        },
        closeButton: {
            padding: spacing.xs,
        },
        scrollView: {
            maxHeight: "70%",
        },
        scrollContent: {
            paddingBottom: spacing.lg,
        },
        section: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
        },
        label: {
            ...typography.body.medium,
            color: colors.text,
            marginBottom: spacing.sm,
            fontSize: 14,
            fontWeight: fontWeight.semiBold,
        },
        input: {
            ...typography.body.medium,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            color: colors.text,
            fontSize: 16,
            minHeight: 48,
        },
        inputFocused: {
            borderColor: colors.primary,
            borderWidth: 2,
        },
        buttonContainer: {
            flexDirection: "row",
            gap: spacing.md,
            padding: spacing.md,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        button: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.md,
            borderRadius: borderRadius.md,
            minHeight: 48,
            gap: spacing.xs,
        },
        cancelButton: {
            backgroundColor: colors.background,
            borderWidth: 2,
            borderColor: colors.border,
            paddingHorizontal: spacing.lg,
        },
        cancelButtonText: {
            ...typography.body.medium,
            color: colors.text,
            fontWeight: fontWeight.semiBold,
            fontSize: 15,
        },
        saveButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.xl,
        },
        saveButtonText: {
            ...typography.body.medium,
            color: colors.white,
            fontWeight: fontWeight.bold,
            fontSize: 15,
        },
        deleteButton: {
            backgroundColor: colors.danger,
            paddingHorizontal: spacing.lg,
        },
        deleteButtonText: {
            ...typography.body.medium,
            color: colors.white,
            fontWeight: fontWeight.semiBold,
            fontSize: 15,
        },
    });

export default AddBudgetModal;
