import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";
import { fontWeight, typography } from "../theme/typography";

interface EmptyStateProps {
    title: string;
    description: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onAction?: () => void;
    actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon,
    onAction,
    actionLabel,
}) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: colors.backgroundSecondary },
                ]}
            >
                <MaterialCommunityIcons
                    name={icon}
                    size={48}
                    color={colors.primary}
                />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text
                style={[styles.description, { color: colors.textSecondary }]}
            >
                {description}
            </Text>
            {onAction && actionLabel && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: colors.primary },
                    ]}
                    onPress={onAction}
                >
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.xl,
        minHeight: 300,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.heading.h3,
        textAlign: "center",
        marginBottom: spacing.sm,
        fontSize: 18,
        fontWeight: fontWeight.bold,
    },
    description: {
        ...typography.body.medium,
        textAlign: "center",
        marginBottom: spacing.xl,
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 25,
    },
    buttonText: {
        ...typography.button.medium,
        color: "#ffffff",
        fontWeight: fontWeight.bold,
    },
});
