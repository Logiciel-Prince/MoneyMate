import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";
import { fontWeight, typography } from "../theme/typography";

export interface DropdownOption {
    label: string;
    value: string;
    icon?: string;
    color?: string;
}

interface DropdownProps {
    label: string;
    placeholder?: string;
    value: string;
    options: DropdownOption[];
    onSelect: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
    label,
    placeholder = "Select an option",
    value,
    options,
    onSelect,
    error,
    disabled = false,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (optionValue: string) => {
        onSelect(optionValue);
        setIsOpen(false);
    };

    return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={[
                    styles.dropdownButton,
                    error && styles.dropdownButtonError,
                    disabled && styles.dropdownButtonDisabled,
                ]}
                onPress={() => !disabled && setIsOpen(true)}
                disabled={disabled}
            >
                <View style={styles.dropdownButtonContent}>
                    {selectedOption?.icon && (
                        <MaterialCommunityIcons
                            name={selectedOption.icon as any}
                            size={20}
                            color={selectedOption.color || colors.text}
                        />
                    )}
                    <Text
                        style={[
                            styles.dropdownButtonText,
                            !selectedOption && styles.dropdownPlaceholder,
                        ]}
                    >
                        {selectedOption?.label || placeholder}
                    </Text>
                </View>
                <MaterialCommunityIcons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>

            {error && (
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons
                        name="alert-circle"
                        size={14}
                        color={colors.danger}
                    />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        item.value === value &&
                                            styles.optionItemSelected,
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    {item.icon && (
                                        <MaterialCommunityIcons
                                            name={item.icon as any}
                                            size={20}
                                            color={
                                                item.value === value
                                                    ? colors.white
                                                    : item.color || colors.text
                                            }
                                        />
                                    )}
                                    <Text
                                        style={[
                                            styles.optionText,
                                            item.value === value &&
                                                styles.optionTextSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <MaterialCommunityIcons
                                            name="check"
                                            size={20}
                                            color={colors.white}
                                            style={styles.checkIcon}
                                        />
                                    )}
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        label: {
            ...typography.body.medium,
            color: colors.text,
            marginBottom: spacing.sm,
            fontSize: 14,
            fontWeight: fontWeight.semiBold,
        },
        dropdownButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            minHeight: 48,
        },
        dropdownButtonError: {
            borderColor: colors.danger,
            borderWidth: 2,
        },
        dropdownButtonDisabled: {
            opacity: 0.5,
        },
        dropdownButtonContent: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            flex: 1,
        },
        dropdownButtonText: {
            ...typography.body.medium,
            color: colors.text,
            fontSize: 16,
        },
        dropdownPlaceholder: {
            color: colors.textTertiary,
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
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.lg,
        },
        modalContent: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            width: "100%",
            maxHeight: "70%",
            overflow: "hidden",
        },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            ...typography.heading.h4,
            color: colors.text,
            fontWeight: fontWeight.bold,
        },
        optionItem: {
            flexDirection: "row",
            alignItems: "center",
            padding: spacing.md,
            gap: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        optionItemSelected: {
            backgroundColor: colors.primary,
        },
        optionText: {
            ...typography.body.medium,
            color: colors.text,
            fontSize: 15,
            flex: 1,
        },
        optionTextSelected: {
            color: colors.white,
            fontWeight: fontWeight.semiBold,
        },
        checkIcon: {
            marginLeft: "auto",
        },
    });
