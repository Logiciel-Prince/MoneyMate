import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing } from '../theme/spacing';
import { fontWeight, typography } from '../theme/typography';
import { Account, AccountType } from '../types/Account';

interface AddAccountModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: Omit<Account, 'id'>) => void;
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

    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [type, setType] = useState<AccountType>(AccountType.CASH);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setName(initialData.name);
                setBalance(initialData.balance.toString());
                setType(initialData.type);
            } else {
                setName('');
                setBalance('');
                setType(AccountType.CASH);
            }
        }
    }, [visible, initialData]);

    const handleSave = () => {
        if (!name.trim()) return;
        const balanceNum = balance.trim() ? parseFloat(balance) : 0;
        if (isNaN(balanceNum)) return;

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
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {initialData ? 'Edit Account' : 'Add Account'}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            <Text style={styles.label}>Account Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. Main Savings"
                                placeholderTextColor={colors.textTertiary}
                            />

                            <Text style={styles.label}>Initial Balance</Text>
                            <TextInput
                                style={styles.input}
                                value={balance}
                                onChangeText={setBalance}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor={colors.textTertiary}
                            />

                            <Text style={styles.label}>Account Type</Text>
                            <View style={styles.typeContainer}>
                                {accountTypes.map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[
                                            styles.typeChip,
                                            type === t && styles.typeChipSelected,
                                        ]}
                                        onPress={() => setType(t)}
                                    >
                                        <Text
                                            style={[
                                                styles.typeText,
                                                type === t && styles.typeTextSelected,
                                            ]}
                                        >
                                            {t.replace(/_/g, ' ').toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <View style={styles.actions}>
                                {initialData && onDelete ? (
                                    <TouchableOpacity
                                        style={[styles.button, styles.deleteButton]}
                                        onPress={handleDelete}
                                    >
                                        <Text style={styles.deleteText}>Delete</Text>
                                    </TouchableOpacity>
                                ) : null}
                                <View style={{ flex: 1 }} />
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onClose}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
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
            justifyContent: 'flex-end',
        },
        keyboardView: {
            width: '100%',
        },
        content: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            padding: spacing.lg,
            maxHeight: '94%', // Almost full height
        },
        scrollContent: {
            paddingBottom: spacing.lg,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        title: {
            ...typography.heading.h3,
            color: colors.text,
        },
        label: {
            ...typography.body.medium,
            color: colors.text,
            marginBottom: spacing.xs,
            fontWeight: fontWeight.medium,
        },
        input: {
            ...typography.body.medium,
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            color: colors.text,
        },
        typeContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
            marginBottom: spacing.md,
        },
        typeChip: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.full,
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        typeChipSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        typeText: {
            ...typography.caption.medium,
            color: colors.text,
        },
        typeTextSelected: {
            color: colors.white,
        },
        footer: {
            marginTop: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
        },
        actions: {
            flexDirection: 'row',
            gap: spacing.sm,
        },
        button: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.md,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        saveButton: {
            backgroundColor: colors.primary,
        },
        deleteButton: {
            backgroundColor: colors.danger + '20',
            borderWidth: 1,
            borderColor: colors.danger,
            marginRight: 'auto',
        },
        cancelText: {
            ...typography.button.medium,
            color: colors.text,
        },
        saveText: {
            ...typography.button.medium,
            color: colors.white,
        },
        deleteText: {
            ...typography.button.medium,
            color: colors.danger,
        },
    });
