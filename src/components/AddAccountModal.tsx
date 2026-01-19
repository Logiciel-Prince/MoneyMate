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
import { Account, AccountType } from "../types/Account";
import { Dropdown } from "./Dropdown";

interface AddAccountModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: Omit<Account, "id">) => void;
    initialData?: Account | null;
    onDelete?: (id: string) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
    visible,
    onClose,
    onSave,
    initialData,
    onDelete,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [name, setName] = useState("");
    const [balance, setBalance] = useState("");
    const [type, setType] = useState<AccountType>(AccountType.CASH);

    // Focus states for better UX
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setName(initialData.name);
                setBalance(initialData.balance.toString());
                setType(initialData.type);
            } else {
                setName("");
                setBalance("");
                setType(AccountType.CASH);
            }
        }
    }, [visible, initialData]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Validation Error", "Please enter an account name", [
                { text: "OK" },
            ]);
            return;
        }
        const balanceNum = balance.trim() ? parseFloat(balance) : 0;
        if (isNaN(balanceNum)) {
            Alert.alert(
                "Validation Error",
                "Please enter a valid balance amount",
                [{ text: "OK" }]
            );
            return;
        }

        onSave({
            name: name.trim(),
            balance: balanceNum,
            type,
        });
        onClose();
    };

    const handleDelete = () => {
        if (initialData && onDelete) {
            onDelete(initialData.id);
            onClose();
        }
    };

    const accountTypes = Object.values(AccountType);

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
                                    name="wallet-plus"
                                    size={28}
                                    color={colors.primary}
                                />
                                <Text style={styles.title}>
                                    {initialData
                                        ? "Edit Account"
                                        : "Add Account"}
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
                            {/* Account Name */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Account Name *</Text>
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
                                    placeholder="e.g. Main Savings"
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>

                            {/* Account Type */}
                            <View style={styles.section}>
                                <Dropdown
                                    label="Account Type *"
                                    placeholder="Select account type"
                                    value={type}
                                    options={accountTypes.map((t) => ({
                                        label: t
                                            .replace(/_/g, " ")
                                            .toUpperCase(),
                                        value: t,
                                        icon:
                                            t === AccountType.CASH
                                                ? "cash"
                                                : t === AccountType.SAVINGS
                                                ? "piggy-bank"
                                                : t === AccountType.CHECKING
                                                ? "bank"
                                                : t === AccountType.CREDIT_CARD
                                                ? "credit-card"
                                                : t === AccountType.INVESTMENT
                                                ? "chart-line"
                                                : "wallet",
                                    }))}
                                    onSelect={(value: string) =>
                                        setType(value as AccountType)
                                    }
                                />
                            </View>

                            {/* Initial Balance */}
                            <View style={styles.section}>
                                <Text style={styles.label}>
                                    {initialData
                                        ? "Current Balance (Read-only)"
                                        : "Initial Balance (Optional)"}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedField === "balance" &&
                                            styles.inputFocused,
                                        initialData && styles.inputDisabled,
                                    ]}
                                    value={balance}
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

                                        setBalance(cleaned);
                                    }}
                                    onFocus={() => setFocusedField("balance")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    placeholderTextColor={colors.textTertiary}
                                    editable={!initialData}
                                />
                                {initialData && (
                                    <Text style={styles.helperText}>
                                        Balance is calculated from transactions
                                        and cannot be edited directly
                                    </Text>
                                )}
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
        inputDisabled: {
            backgroundColor: colors.surfaceVariant || colors.border,
            opacity: 0.6,
        },
        helperText: {
            ...typography.caption.medium,
            color: colors.textSecondary,
            marginTop: spacing.xs,
            fontSize: 12,
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
