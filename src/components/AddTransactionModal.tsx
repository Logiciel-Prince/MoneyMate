import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
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
    Transaction,
    TransactionCategory,
    TransactionType,
} from "../types/Transaction";
import { storage } from "../utils/storage";

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
}

const STORAGE_KEYS = {
    ACCOUNTS: "accounts",
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
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<TransactionCategory>(
        TransactionCategory.OTHER_EXPENSE
    );
    const [fromAccount, setFromAccount] = useState<string>("");
    const [toAccount, setToAccount] = useState<string>("");
    const [date, setDate] = useState(new Date());
    const [notes, setNotes] = useState("");
    const [accounts, setAccounts] = useState<Account[]>([]);

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
        loadAccounts();
    }, [loadAccounts]);

    const resetForm = () => {
        setType(TransactionType.DEBIT);
        setAmount("");
        setTitle("");
        setCategory(TransactionCategory.OTHER_EXPENSE);
        setNotes("");
        if (accounts.length > 0) {
            setFromAccount(accounts[0].id);
        }
    };

    const handleSave = () => {
        if (!amount || !title || !fromAccount) {
            alert("Please fill in all required fields");
            return;
        }

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type,
            amount: parseFloat(amount),
            title,
            category,
            accountId: fromAccount,
            toAccountId:
                type === TransactionType.TRANSFER ? toAccount : undefined,
            date,
            notes,
        };

        onSave(newTransaction);
        resetForm();
        onClose();
    };

    const getCategories = (): TransactionCategory[] => {
        if (type === TransactionType.CREDIT) {
            return [
                TransactionCategory.SALARY,
                TransactionCategory.FREELANCE,
                TransactionCategory.INVESTMENT,
                TransactionCategory.GIFT,
                TransactionCategory.REFUND,
                TransactionCategory.OTHER_INCOME,
            ];
        } else if (type === TransactionType.DEBIT) {
            return [
                TransactionCategory.FOOD,
                TransactionCategory.TRANSPORT,
                TransactionCategory.SHOPPING,
                TransactionCategory.ENTERTAINMENT,
                TransactionCategory.BILLS,
                TransactionCategory.HEALTHCARE,
                TransactionCategory.EDUCATION,
                TransactionCategory.TRAVEL,
                TransactionCategory.GROCERIES,
                TransactionCategory.UTILITIES,
                TransactionCategory.RENT,
                TransactionCategory.OTHER_EXPENSE,
            ];
        }
        return [];
    };

    const getCategoryLabel = (cat: TransactionCategory): string => {
        return cat
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
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
                                        setCategory(TransactionCategory.SALARY);
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
                                        setCategory(TransactionCategory.FOOD);
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
                            <TextInput
                                style={styles.input}
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                placeholderTextColor={colors.textTertiary}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        {/* Title */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Enter transaction title"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>

                        {/* Category (only for income/expense) */}
                        {type !== TransactionType.TRANSFER && (
                            <View style={styles.section}>
                                <Text style={styles.label}>Category</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoryScroll}
                                >
                                    {getCategories().map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryChip,
                                                category === cat && {
                                                    backgroundColor:
                                                        type ===
                                                        TransactionType.CREDIT
                                                            ? colors.success
                                                            : colors.danger,
                                                    borderColor:
                                                        type ===
                                                        TransactionType.CREDIT
                                                            ? colors.success
                                                            : colors.danger,
                                                },
                                            ]}
                                            onPress={() => setCategory(cat)}
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryChipText,
                                                    category === cat && {
                                                        color: colors.white,
                                                    },
                                                ]}
                                            >
                                                {getCategoryLabel(cat)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* From Account */}
                        <View style={styles.section}>
                            <Text style={styles.label}>
                                {type === TransactionType.TRANSFER
                                    ? "From Account *"
                                    : "Account *"}
                            </Text>
                            <View style={styles.accountContainer}>
                                {accounts.map((acc) => (
                                    <TouchableOpacity
                                        key={acc.id}
                                        style={[
                                            styles.accountChip,
                                            fromAccount === acc.id && {
                                                backgroundColor: colors.primary,
                                                borderColor: colors.primary,
                                            },
                                        ]}
                                        onPress={() => setFromAccount(acc.id)}
                                    >
                                        <Text
                                            style={[
                                                styles.accountChipText,
                                                fromAccount === acc.id && {
                                                    color: colors.white,
                                                },
                                            ]}
                                        >
                                            {acc.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* To Account (only for transfers) */}
                        {type === TransactionType.TRANSFER && (
                            <View style={styles.section}>
                                <Text style={styles.label}>To Account *</Text>
                                <View style={styles.accountContainer}>
                                    {accounts
                                        .filter((acc) => acc.id !== fromAccount)
                                        .map((acc) => (
                                            <TouchableOpacity
                                                key={acc.id}
                                                style={[
                                                    styles.accountChip,
                                                    toAccount === acc.id && {
                                                        backgroundColor:
                                                            colors.primary,
                                                        borderColor:
                                                            colors.primary,
                                                    },
                                                ]}
                                                onPress={() =>
                                                    setToAccount(acc.id)
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.accountChipText,
                                                        toAccount ===
                                                            acc.id && {
                                                            color: colors.white,
                                                        },
                                                    ]}
                                                >
                                                    {acc.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                </View>
                            </View>
                        )}

                        {/* Notes */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Notes (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.notesInput]}
                                value={notes}
                                onChangeText={setNotes}
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
            padding: spacing.lg,
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
