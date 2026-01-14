import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
import { Goal } from "../types/Goal";

interface AddGoalModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: Partial<Goal>) => void;
    initialData?: Goal | null;
    onDelete?: (id: string) => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
    visible,
    onClose,
    onSave,
    initialData,
    onDelete,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [savedAmount, setSavedAmount] = useState("");

    // Focus states for better UX
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setName(initialData.name);
                setTargetAmount(initialData.targetAmount.toString());
                setSavedAmount(initialData.savedAmount.toString());
            } else {
                setName("");
                setTargetAmount("");
                setSavedAmount("");
            }
        }
    }, [visible, initialData]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Validation Error", "Please enter a goal name", [
                { text: "OK" },
            ]);
            return;
        }

        if (!targetAmount) {
            Alert.alert("Validation Error", "Please enter a target amount", [
                { text: "OK" },
            ]);
            return;
        }

        const target = parseFloat(targetAmount);
        const saved = parseFloat(savedAmount) || 0;

        if (isNaN(target) || target <= 0) {
            Alert.alert(
                "Validation Error",
                "Please enter a valid target amount greater than 0",
                [{ text: "OK" }]
            );
            return;
        }

        onSave({
            name,
            targetAmount: target,
            savedAmount: initialData ? initialData.savedAmount : saved,
        });
        onClose();
    };

    const handleDelete = () => {
        if (initialData && onDelete) {
            onDelete(initialData.id);
            onClose();
        }
    };

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
                                    name="flag-checkered"
                                    size={28}
                                    color={colors.primary}
                                />
                                <Text style={styles.title}>
                                    {initialData
                                        ? "Edit Goal"
                                        : "New Savings Goal"}
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
                            {/* Goal Name */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Goal Name *</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedField === "name" &&
                                            styles.inputFocused,
                                    ]}
                                    value={name}
                                    onChangeText={setName}
                                    onFocus={() => setFocusedField("name")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="e.g. New Car, Vacation"
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>

                            {/* Target Amount */}
                            <View style={styles.section}>
                                <Text style={styles.label}>
                                    Target Amount *
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedField === "target" &&
                                            styles.inputFocused,
                                    ]}
                                    value={targetAmount}
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

                                        setTargetAmount(cleaned);
                                    }}
                                    onFocus={() => setFocusedField("target")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>

                            {/* Initial Savings - Only for new goals */}
                            {!initialData && (
                                <View style={styles.section}>
                                    <Text style={styles.label}>
                                        Initial Savings (Optional)
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            focusedField === "saved" &&
                                                styles.inputFocused,
                                        ]}
                                        value={savedAmount}
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

                                            setSavedAmount(cleaned);
                                        }}
                                        onFocus={() => setFocusedField("saved")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="0.00"
                                        keyboardType="decimal-pad"
                                        placeholderTextColor={
                                            colors.textTertiary
                                        }
                                    />
                                </View>
                            )}
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
            maxHeight: "60%",
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
            padding: spacing.lg,
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
