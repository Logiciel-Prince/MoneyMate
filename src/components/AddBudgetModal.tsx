import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
import { Budget } from '../types/Budget';
import { CustomCategory } from '../types/Category';

interface AddBudgetModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: Omit<Budget, 'id'>) => void;
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

    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

    React.useEffect(() => {
        if (visible) {
            if (initialData) {
                setAmount(initialData.limit.toString());
                setSelectedCategoryId(initialData.categoryId);
                setPeriod(initialData.period);
            } else {
                setAmount('');
                setSelectedCategoryId('');
                setPeriod('monthly');
            }
        }
    }, [visible, initialData]);

    const handleSave = () => {
        const limit = parseFloat(amount);
        if (isNaN(limit) || limit <= 0 || !selectedCategoryId) return;

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
                                {initialData ? 'Edit Budget' : 'Set Budget'}
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
                            <Text style={styles.label}>Monthly Limit</Text>
                            <TextInput
                                style={styles.input}
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor={colors.textTertiary}
                            />

                            <Text style={styles.label}>Category</Text>
                            <View style={styles.categoriesContainer}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryChip,
                                            selectedCategoryId === cat.id && { backgroundColor: cat.color || colors.primary, borderColor: cat.color || colors.primary },
                                        ]}
                                        onPress={() => setSelectedCategoryId(cat.id)}
                                    >
                                        <MaterialCommunityIcons 
                                            name={cat.icon as any || 'currency-usd'} 
                                            size={16} 
                                            color={selectedCategoryId === cat.id ? '#fff' : colors.text} 
                                        />
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                selectedCategoryId === cat.id && styles.categoryTextSelected,
                                            ]}
                                        >
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <View style={styles.actions}>
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
            maxHeight: '94%',
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
        categoriesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
            marginBottom: spacing.md,
        },
        categoryChip: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.full,
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 4,
        },
        categoryText: {
            ...typography.caption.medium,
            color: colors.text,
        },
        categoryTextSelected: {
            color: '#fff',
            fontWeight: fontWeight.bold,
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
