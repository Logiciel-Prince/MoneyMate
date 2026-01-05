import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { fontSize, fontWeight } from '../theme/typography';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDangerous?: boolean;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isDangerous = false,
    icon = 'alert-circle-outline',
}) => {
    const { colors } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
                    {/* Icon */}
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                backgroundColor: isDangerous
                                    ? 'rgba(239, 68, 68, 0.1)'
                                    : 'rgba(59, 130, 246, 0.1)',
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={icon}
                            size={32}
                            color={isDangerous ? colors.danger : colors.primary}
                        />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.text }]}>
                        {title}
                    </Text>

                    {/* Message */}
                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                        {message}
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.cancelButton,
                                { backgroundColor: colors.background },
                            ]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                {
                                    backgroundColor: isDangerous
                                        ? colors.danger
                                        : colors.primary,
                                },
                            ]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, styles.confirmButtonText]}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    dialog: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: spacing.xl,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    message: {
        fontSize: fontSize.md,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.2)',
    },
    confirmButton: {
        // backgroundColor set dynamically
    },
    buttonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semiBold,
    },
    confirmButtonText: {
        color: '#FFFFFF',
    },
});

export default ConfirmDialog;
