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
    showNotification?: boolean;
    showThemeToggle?: boolean;
}

/**
 * Common Screen Header Component
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    showLogo = false,
    showNotification = true,
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
                        <MaterialCommunityIcons
                            name="wallet-outline"
                            size={28}
                            color={colors.primary}
                        />
                    )}
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {title}
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    {showNotification && (
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                { backgroundColor: `${colors.primary}10` },
                            ]}
                            onPress={() => {
                                // TODO: Navigate to notifications
                                console.log("Notifications pressed");
                            }}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={22}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    )}

                    {showThemeToggle && (
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                { backgroundColor: `${colors.primary}10` },
                            ]}
                            onPress={toggleTheme}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={
                                    isDark
                                        ? "white-balance-sunny"
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
        borderBottomWidth: 1,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.5,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default ScreenHeader;
