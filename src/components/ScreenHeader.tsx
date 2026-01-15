import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";
import { fontWeight } from "../theme/typography";

interface ScreenHeaderProps {
    title: string;
    showLogo?: boolean;
    showThemeToggle?: boolean;
}

/**
 * Common Screen Header Component
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    showLogo = false,
    showThemeToggle = true,
}) => {
    const { colors, isDark, toggleTheme } = useTheme();

    return (
        <SafeAreaView
            style={{ backgroundColor: colors.surface }}
            edges={["top"]}
        >
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: colors.surface,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <View style={styles.headerContent}>
                    {showLogo && (
                        <View
                            style={[
                                styles.logoContainer,
                                { backgroundColor: colors.primary + "15" },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="wallet"
                                size={24}
                                color={colors.primary}
                            />
                        </View>
                    )}
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {title}
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    {showThemeToggle && (
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                {
                                    backgroundColor: isDark
                                        ? "rgba(255,255,255,0.08)"
                                        : "rgba(0,0,0,0.04)",
                                },
                            ]}
                            onPress={toggleTheme}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={
                                    isDark
                                        ? "weather-sunny"
                                        : "moon-waning-crescent"
                                }
                                size={22}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 0.5,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        flex: 1,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.3,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    iconButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default ScreenHeader;
