import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Modal,
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
import { Account } from "../types/Account";
import {
    CustomCategory,
    DEFAULT_EXPENSE_CATEGORIES,
    DEFAULT_INCOME_CATEGORIES,
} from "../types/Category";
import { Transaction, TransactionType } from "../types/Transaction";
import { storage } from "../utils/storage";
import { Dropdown } from "./Dropdown";

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
}

const STORAGE_KEYS = {
    ACCOUNTS: "accounts",
    CATEGORIES: "custom_categories",
};

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [type, setType] = useState<TransactionType>(TransactionType.DEBIT);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<string>("");
    const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
        []
    );
    const [fromAccount, setFromAccount] = useState<string>("");
    const [toAccount, setToAccount] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Focus states for better UX
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<{
        amount?: string;
        account?: string;
        toAccount?: string;
    }>({});

    // Load accounts
    const loadAccounts = useCallback(async () => {
        const storedAccounts = await storage.getData<Account[]>(
            STORAGE_KEYS.ACCOUNTS
        );
        if (storedAccounts) {
            setAccounts(storedAccounts);
            if (storedAccounts.length > 0 && !fromAccount) {
                setFromAccount(storedAccounts[0].id);
                if (
                    type === TransactionType.TRANSFER &&
                    storedAccounts.length > 1
                ) {
                    setToAccount(storedAccounts[1].id);
                }
            }
        }
    }, [fromAccount, type]);

    useEffect(() => {
        if (visible) {
            loadAccounts();
            loadCategories();
        }
    }, [visible, loadAccounts]);

    const loadCategories = async () => {
        try {
            let stored = await storage.getData<CustomCategory[]>(
                STORAGE_KEYS.CATEGORIES
            );
            if (!stored || stored.length === 0) {
                stored = [
                    ...DEFAULT_INCOME_CATEGORIES,
                    ...DEFAULT_EXPENSE_CATEGORIES,
                ];
            }
            setCustomCategories(stored);

            // Set default category
            const expenseCats = stored.filter((c) => c.type === "expense");
            if (expenseCats.length > 0) {
                setCategory(expenseCats[0].id);
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const resetForm = () => {
        setType(TransactionType.DEBIT);
        setAmount("");
        // Reset to first expense category if available
        const expenseCats = customCategories.filter(
            (c) => c.type === "expense"
        );
        if (expenseCats.length > 0) {
            setCategory(expenseCats[0].id);
        }
        setNotes("");
        setErrors({});
        setFocusedField(null);
        if (accounts.length > 0) {
            setFromAccount(accounts[0].id);
        }
    };

    // Validate amount input - only allow numbers and single decimal point
    const handleAmountChange = (text: string) => {
        // Remove any non-numeric characters except decimal point
        const cleaned = text.replace(/[^0-9.]/g, "");

        // Ensure only one decimal point
        const parts = cleaned.split(".");
        if (parts.length > 2) {
            return; // Don't update if more than one decimal point
        }

        // Limit decimal places to 2
        if (parts.length === 2 && parts[1].length > 2) {
            return;
        }

        setAmount(cleaned);

        // Clear error when user starts typing
        if (errors.amount) {
            setErrors({ ...errors, amount: undefined });
        }
    };

    const handleSave = async () => {
        // Validate all fields
        const newErrors: typeof errors = {};

        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = "Please enter a valid amount";
        }

        if (!fromAccount) {
            newErrors.account = "Please select an account";
        }

        if (type === TransactionType.TRANSFER && !toAccount) {
            newErrors.toAccount = "Please select destination account";
        }

        if (type === TransactionType.TRANSFER && fromAccount === toAccount) {
            newErrors.toAccount = "Destination must be different from source";
        }

        // If there are errors, show them and don't save
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Alert.alert(
                "Validation Error",
                "Please fill in all required fields correctly",
                [{ text: "OK" }]
            );
            return;
        }

        // Auto-generate title based on category or transaction type
        let autoTitle = "";
        if (type === TransactionType.TRANSFER) {
            const fromAcc = accounts.find((a) => a.id === fromAccount);
            const toAcc = accounts.find((a) => a.id === toAccount);
            autoTitle = `Transfer from ${fromAcc?.name || "Account"} to ${
                toAcc?.name || "Account"
            }`;
        } else {
            const selectedCategory = customCategories.find(
                (c) => c.id === category
            );
            autoTitle =
                selectedCategory?.name ||
                (type === TransactionType.CREDIT ? "Income" : "Expense");
        }

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type,
            amount: parseFloat(amount),
            title: autoTitle,
            category,
            accountId: fromAccount,
            toAccountId:
                type === TransactionType.TRANSFER ? toAccount : undefined,
            date: new Date(),
            notes: notes.trim(),
        };

        console.log("Saving transaction:", newTransaction);

        // Call onSave and wait for it to complete
        await onSave(newTransaction);

        console.log("Transaction saved successfully");

        resetForm();
        onClose();
    };

    const getCategories = (): CustomCategory[] => {
        if (type === TransactionType.CREDIT) {
            return customCategories.filter((c) => c.type === "income");
        } else if (type === TransactionType.DEBIT) {
            return customCategories.filter((c) => c.type === "expense");
        }
        return [];
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Add Transaction</Text>
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

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Transaction Type */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        type === TransactionType.CREDIT &&
                                            styles.typeButtonActive,
                                        type === TransactionType.CREDIT && {
                                            backgroundColor: colors.success,
                                            borderColor: colors.success,
                                        },
                                    ]}
                                    onPress={() => {
                                        setType(TransactionType.CREDIT);
                                        const incomeCats =
                                            customCategories.filter(
                                                (c) => c.type === "income"
                                            );
                                        if (incomeCats.length > 0)
                                            setCategory(incomeCats[0].id);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="arrow-down-circle"
                                        size={20}
                                        color={
                                            type === TransactionType.CREDIT
                                                ? colors.white
                                                : colors.success
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            type === TransactionType.CREDIT && {
                                                color: colors.white,
                                            },
                                            type !== TransactionType.CREDIT && {
                                                color: colors.success,
                                            },
                                        ]}
                                    >
                                        Income
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        type === TransactionType.DEBIT &&
                                            styles.typeButtonActive,
                                        type === TransactionType.DEBIT && {
                                            backgroundColor: colors.danger,
                                            borderColor: colors.danger,
                                        },
                                    ]}
                                    onPress={() => {
                                        setType(TransactionType.DEBIT);
                                        const expenseCats =
                                            customCategories.filter(
                                                (c) => c.type === "expense"
                                            );
                                        if (expenseCats.length > 0)
                                            setCategory(expenseCats[0].id);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="arrow-up-circle"
                                        size={20}
                                        color={
                                            type === TransactionType.DEBIT
                                                ? colors.white
                                                : colors.danger
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            type === TransactionType.DEBIT && {
                                                color: colors.white,
                                            },
                                            type !== TransactionType.DEBIT && {
                                                color: colors.danger,
                                            },
                                        ]}
                                    >
                                        Expense
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        type === TransactionType.TRANSFER &&
                                            styles.typeButtonActive,
                                        type === TransactionType.TRANSFER && {
                                            backgroundColor: colors.primary,
                                            borderColor: colors.primary,
                                        },
                                    ]}
                                    onPress={() =>
                                        setType(TransactionType.TRANSFER)
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="swap-horizontal"
                                        size={20}
                                        color={
                                            type === TransactionType.TRANSFER
                                                ? colors.white
                                                : colors.primary
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            type ===
                                                TransactionType.TRANSFER && {
                                                color: colors.white,
                                            },
                                            type !==
                                                TransactionType.TRANSFER && {
                                                color: colors.primary,
                                            },
                                        ]}
                                    >
                                        Transfer
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Amount */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Amount *</Text>
                            <View>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedField === "amount" &&
                                            styles.inputFocused,
                                        errors.amount && styles.inputError,
                                    ]}
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    onFocus={() => setFocusedField("amount")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textTertiary}
                                    keyboardType="decimal-pad"
                                />
                                {errors.amount && (
                                    <View style={styles.errorContainer}>
                                        <MaterialCommunityIcons
                                            name="alert-circle"
                                            size={14}
                                            color={colors.danger}
                                        />
                                        <Text style={styles.errorText}>
                                            {errors.amount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Category (only for income/expense) */}
                        {type !== TransactionType.TRANSFER && (
                            <View style={styles.section}>
                                <Dropdown
                                    label="Category"
                                    placeholder="Select a category"
                                    value={category}
                                    options={getCategories().map((cat) => ({
                                        label: cat.name,
                                        value: cat.id,
                                        icon: cat.icon,
                                        color: cat.color,
                                    }))}
                                    onSelect={(value) => {
                                        setCategory(value);
                                        if (errors.account) {
                                            setErrors({
                                                ...errors,
                                                account: undefined,
                                            });
                                        }
                                    }}
                                />
                            </View>
                        )}

                        {/* From Account */}
                        <View style={styles.section}>
                            <Dropdown
                                label={
                                    type === TransactionType.TRANSFER
                                        ? "From Account *"
                                        : "Account *"
                                }
                                placeholder="Select an account"
                                value={fromAccount}
                                options={accounts.map((acc) => ({
                                    label: `${acc.name} (${acc.type})`,
                                    value: acc.id,
                                    icon: "wallet",
                                }))}
                                onSelect={(value) => {
                                    setFromAccount(value);
                                    if (errors.account) {
                                        setErrors({
                                            ...errors,
                                            account: undefined,
                                        });
                                    }
                                }}
                                error={errors.account}
                            />
                        </View>

                        {/* To Account (only for transfers) */}
                        {type === TransactionType.TRANSFER && (
                            <View style={styles.section}>
                                <Dropdown
                                    label="To Account *"
                                    placeholder="Select destination account"
                                    value={toAccount}
                                    options={accounts
                                        .filter((acc) => acc.id !== fromAccount)
                                        .map((acc) => ({
                                            label: `${acc.name} (${acc.type})`,
                                            value: acc.id,
                                            icon: "wallet",
                                        }))}
                                    onSelect={(value) => {
                                        setToAccount(value);
                                        if (errors.toAccount) {
                                            setErrors({
                                                ...errors,
                                                toAccount: undefined,
                                            });
                                        }
                                    }}
                                    error={errors.toAccount}
                                />
                            </View>
                        )}
                        {/* Notes */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Notes (Optional)</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.notesInput,
                                    focusedField === "notes" &&
                                        styles.inputFocused,
                                ]}
                                value={notes}
                                onChangeText={setNotes}
                                onFocus={() => setFocusedField("notes")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Add notes..."
                                placeholderTextColor={colors.textTertiary}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
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
                                <Text style={styles.saveButtonText}>
                                    Save Transaction
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
        },
        modalContent: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            maxHeight: "90%",
            paddingBottom: spacing.xl,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            ...typography.heading.h3,
            color: colors.text,
            fontSize: 20,
            fontWeight: fontWeight.bold,
        },
        closeButton: {
            padding: spacing.xs,
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
        typeContainer: {
            flexDirection: "row",
            gap: spacing.sm,
        },
        typeButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            borderColor: colors.border,
            gap: spacing.xs,
        },
        typeButtonActive: {
            borderWidth: 2,
        },
        typeButtonText: {
            ...typography.body.small,
            fontSize: 13,
            fontWeight: fontWeight.semiBold,
        },
        input: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            color: colors.text,
            fontSize: 16,
        },
        inputFocused: {
            borderColor: colors.primary,
            borderWidth: 2,
        },
        inputError: {
            borderColor: colors.danger,
            borderWidth: 2,
        },
        errorContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: spacing.xs,
            gap: spacing.xs,
        },
        errorText: {
            ...typography.caption.small,
            color: colors.danger,
            fontSize: 12,
        },
        dateButton: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            gap: spacing.sm,
        },
        dateButtonText: {
            ...typography.body.medium,
            color: colors.text,
            fontSize: 15,
        },
        notesInput: {
            height: 80,
            textAlignVertical: "top",
        },
        categoryScroll: {
            marginTop: spacing.xs,
        },
        categoryChip: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: spacing.sm,
        },
        categoryChipText: {
            ...typography.body.small,
            color: colors.textSecondary,
            fontSize: 13,
        },
        accountContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        accountChip: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            borderColor: colors.border,
        },
        accountChipText: {
            ...typography.body.small,
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: fontWeight.semiBold,
        },
        buttonContainer: {
            flexDirection: "row",
            gap: spacing.md,
            padding: spacing.lg,
            paddingTop: spacing.md,
        },
        button: {
            flex: 1,
            padding: spacing.sm,
            borderRadius: borderRadius.md,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 48,
        },
        cancelButton: {
            backgroundColor: colors.background,
            borderWidth: 2,
            borderColor: colors.border,
        },
        cancelButtonText: {
            ...typography.body.medium,
            color: colors.text,
            fontWeight: fontWeight.semiBold,
        },
        saveButton: {
            backgroundColor: colors.primary,
        },
        saveButtonText: {
            ...typography.body.medium,
            color: colors.white,
            fontWeight: fontWeight.bold,
        },
    });

export default AddTransactionModal;
