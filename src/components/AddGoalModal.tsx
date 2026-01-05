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
import { fontWeight } from '../theme/typography';
import { Goal } from '../types/Goal';

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

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [savedAmount, setSavedAmount] = useState(''); // Only editable if new, or maybe "Add Money" is separate? 
    // Usually editing Goal allows changing Name/Target. Current Amount is managed via transactions or dedicated Add Money.
    // However, for simplicity, I'll allow editing "Initial Amount" only when creating?
    // User's previous code allowed Initial Amount only on Create.

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setName(initialData.name);
                setTargetAmount(initialData.targetAmount.toString());
                setSavedAmount(initialData.savedAmount.toString());
            } else {
                setName('');
                setTargetAmount('');
                setSavedAmount('');
            }
        }
    }, [visible, initialData]);

    const handleSave = () => {
        if (!name.trim() || !targetAmount) return;
        const target = parseFloat(targetAmount);
        const saved = parseFloat(savedAmount) || 0;

        if (isNaN(target) || target <= 0) return;

        onSave({
            name,
            targetAmount: target,
            savedAmount: initialData ? initialData.savedAmount : saved, // If editing, keep savedAmount logic mostly separate or allow? 
            // Previous logic: savedAmount update via "Add Money". 
            // But if I want to correct balance? I'll allow passing savedAmount if needed, but usually we just update Name/Target.
            // Let's stick to Name/Target for Edit, and Name/Target/Initial for Create.
            // Actually, if I allow editing savedAmount directly here, it overrides transactions.
            // I'll stick to previous logic: initialAmount user input is used only on creation.
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
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {initialData ? 'Edit Goal' : 'New Savings Goal'}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Goal Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. New Car"
                                placeholderTextColor={colors.textTertiary}
                            />

                            <Text style={styles.label}>Target Amount</Text>
                            <TextInput
                                style={styles.input}
                                value={targetAmount}
                                onChangeText={setTargetAmount}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor={colors.textTertiary}
                            />

                            {!initialData && (
                                <>
                                    <Text style={styles.label}>Initial Savings (Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={savedAmount}
                                        onChangeText={setSavedAmount}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                </>
                            )}
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
                                ) : (
                                    <View style={{ flex: 1 }} />
                                )}
                                {!initialData && !onDelete && <View style={{ flex: 1 }} />}
                                
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
            maxHeight: '90%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        title: {
            fontSize: 20,
            fontWeight: fontWeight.bold,
            color: colors.text,
        },
        label: {
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
        footer: {
            marginTop: spacing.md,
            paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
        },
        actions: {
            flexDirection: 'row',
            gap: spacing.sm,
            justifyContent: 'flex-end',
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
            backgroundColor: colors.danger + '20', // transparent red
            borderWidth: 1,
            borderColor: colors.danger,
            marginRight: 'auto',
        },
        cancelText: {
            color: colors.text,
            fontWeight: fontWeight.medium,
        },
        saveText: {
            color: '#fff',
            fontWeight: fontWeight.bold,
        },
        deleteText: {
            color: colors.danger,
            fontWeight: fontWeight.medium,
        },
    });
