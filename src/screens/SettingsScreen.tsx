import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../theme/spacing";
import { fontWeight, typography } from "../theme/typography";
import { DEFAULT_CURRENCY } from "../utils/currency";
import { storage } from "../utils/storage";

/**
 * Storage keys
 */
const STORAGE_KEYS = {
    SETTINGS: "settings",
    ACCOUNTS: "accounts",
    TRANSACTIONS: "transactions",
    GOALS: "goals",
};

/**
 * Settings interface
 */
interface AppSettings {
    smsTrackingEnabled: boolean;
    currency: string;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: AppSettings = {
    smsTrackingEnabled: false,
    currency: DEFAULT_CURRENCY,
};

/**
 * SettingsScreen - App settings and preferences
 */
export const SettingsScreen: React.FC = () => {
    const { colors, isDark, toggleTheme } = useTheme();
    const { currency, setCurrency: updateCurrency } = useCurrency();
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);

    const currencies = [
        { code: "INR", name: "Indian Rupee", symbol: "₹" },
        { code: "USD", name: "US Dollar", symbol: "$" },
        { code: "EUR", name: "Euro", symbol: "€" },
        { code: "GBP", name: "British Pound", symbol: "£" },
        { code: "JPY", name: "Japanese Yen", symbol: "¥" },
        { code: "AUD", name: "Australian Dollar", symbol: "A$" },
        { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    ];

    /**
     * Load settings from storage
     */
    const loadSettings = async () => {
        try {
            const storedSettings = await storage.getData<AppSettings>(
                STORAGE_KEYS.SETTINGS
            );
            setSettings(storedSettings || DEFAULT_SETTINGS);
        } catch (error) {
            console.error("Error loading settings:", error);
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Save settings to storage
     */
    const saveSettings = async (updatedSettings: AppSettings) => {
        try {
            await storage.saveData(STORAGE_KEYS.SETTINGS, updatedSettings);
            setSettings(updatedSettings);
        } catch (error) {
            console.error("Error saving settings:", error);
            Alert.alert("Error", "Failed to save settings");
        }
    };

    /**
     * Initial load
     */
    useEffect(() => {
        loadSettings();
    }, []);

    /**
     * Reload settings when screen comes into focus
     */
    useFocusEffect(
        useCallback(() => {
            loadSettings();
        }, [])
    );

    /**
     * Handle currency selection
     */
    const handleCurrencySelect = async (currencyCode: string) => {
        // Update currency context (this will update the entire app)
        await updateCurrency(currencyCode);

        // Also update local settings
        const updatedSettings = {
            ...settings,
            currency: currencyCode,
        };
        await saveSettings(updatedSettings);
        setShowCurrencyModal(false);
    };

    /**
     * Handle SMS tracking toggle
     */
    const handleSMSTrackingToggle = async (value: boolean) => {
        if (value) {
            Alert.alert(
                "Enable SMS Tracking",
                "This would request SMS permissions to automatically track banking transactions.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Enable",
                        onPress: async () => {
                            const updatedSettings = {
                                ...settings,
                                smsTrackingEnabled: value,
                            };
                            await saveSettings(updatedSettings);
                            // Alert.alert("Enabled", "SMS tracking active");
                        },
                    },
                ]
            );
        } else {
            const updatedSettings = {
                ...settings,
                smsTrackingEnabled: value,
            };
            await saveSettings(updatedSettings);
        }
    };

    /**
     * Handle clear all data
     */
    const handleClearAllData = () => {
        Alert.alert(
            "Clear All Data",
            "Are you sure? This will delete all accounts, transactions, and goals. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await Promise.all([
                                storage.removeData(STORAGE_KEYS.ACCOUNTS),
                                storage.removeData(STORAGE_KEYS.TRANSACTIONS),
                                storage.removeData(STORAGE_KEYS.GOALS),
                                storage.removeData(STORAGE_KEYS.SETTINGS),
                            ]);

                            setSettings(DEFAULT_SETTINGS);
                            Alert.alert(
                                "Success",
                                "All data has been cleared."
                            );
                        } catch (error) {
                            console.error("Error clearing data:", error);
                            Alert.alert("Error", "Failed to clear data");
                        }
                    },
                },
            ]
        );
    };

    /**
     * Render setting item
     */
    const renderSettingItem = (
        iconName: keyof typeof MaterialCommunityIcons.glyphMap,
        title: string,
        description: string,
        onPress?: () => void,
        rightElement?: React.ReactNode,
        isDestructive: boolean = false
    ) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View
                style={[
                    styles.settingIcon,
                    {
                        backgroundColor: isDestructive
                            ? "rgba(239, 68, 68, 0.1)"
                            : colors.background,
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name={iconName}
                    size={22}
                    color={isDestructive ? colors.danger : colors.primary}
                />
            </View>
            <View style={styles.settingContent}>
                <Text
                    style={[
                        styles.settingTitle,
                        { color: isDestructive ? colors.danger : colors.text },
                    ]}
                >
                    {title}
                </Text>
                <Text
                    style={[
                        styles.settingDescription,
                        { color: colors.textSecondary },
                    ]}
                >
                    {description}
                </Text>
            </View>
            {rightElement && (
                <View style={styles.settingRight}>{rightElement}</View>
            )}
        </TouchableOpacity>
    );

    /**
     * Render section header
     */
    const renderSectionHeader = (title: string) => (
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {title}
        </Text>
    );

    if (loading) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
            >
                <View style={styles.loadingContainer}>
                    <Text
                        style={[
                            styles.loadingText,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Loading settings...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* App Info */}
                <View
                    style={[
                        styles.appInfoCard,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <View style={styles.appIconContainer}>
                        <MaterialCommunityIcons
                            name="wallet-outline"
                            size={40}
                            color={colors.primary}
                        />
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>
                        MoneyMate
                    </Text>
                    <Text
                        style={[
                            styles.appVersion,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Version 1.0.0
                    </Text>
                </View>

                {/* Preferences Section */}
                {renderSectionHeader("Preferences")}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    {renderSettingItem(
                        "theme-light-dark",
                        "Dark Mode",
                        isDark ? "Dark mode is enabled" : "Switch to dark mode",
                        toggleTheme, // Use the toggleTheme from context
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{
                                false: colors.border,
                                true: colors.primary,
                            }}
                            thumbColor={"#FFF"} // Always white thumb looks good
                        />
                    )}
                    {renderSettingItem(
                        "message-processing",
                        "SMS Tracking",
                        settings.smsTrackingEnabled
                            ? "Auto-tracking active"
                            : "Enable to track bank SMS",
                        () =>
                            handleSMSTrackingToggle(
                                !settings.smsTrackingEnabled
                            ),
                        <Switch
                            value={settings.smsTrackingEnabled}
                            onValueChange={handleSMSTrackingToggle}
                            trackColor={{
                                false: colors.border,
                                true: colors.primary,
                            }}
                            thumbColor={"#FFF"}
                        />
                    )}
                    {renderSettingItem(
                        "currency-usd",
                        "Currency",
                        currencies.find((c) => c.code === currency)?.name ||
                            "Indian Rupee",
                        () => setShowCurrencyModal(true),
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textTertiary}
                        />
                    )}
                </View>

                {/* Data Management Section */}
                {renderSectionHeader("Data & Storage")}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    {renderSettingItem(
                        "export",
                        "Export Data",
                        "Backup your data to a JSON file",
                        () =>
                            Alert.alert(
                                "Coming Soon",
                                "Data export will be available in the next update."
                            ),
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textTertiary}
                        />
                    )}
                    {renderSettingItem(
                        "import",
                        "Import Data",
                        "Restore from backup",
                        () =>
                            Alert.alert(
                                "Coming Soon",
                                "Data import will be available in the next update."
                            ),
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textTertiary}
                        />
                    )}
                </View>

                {/* Danger Zone */}
                {renderSectionHeader("Danger Zone")}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    {renderSettingItem(
                        "delete-outline",
                        "Clear All Data",
                        "Permanently delete all records",
                        handleClearAllData,
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.danger}
                        />,
                        true
                    )}
                </View>

                {/* About Section */}
                {renderSectionHeader("About")}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    {renderSettingItem(
                        "information-outline",
                        "About",
                        "Learn more about MoneyMate",
                        () =>
                            Alert.alert(
                                "MoneyMate",
                                "Personal Finance Manager\nv1.0.0"
                            ),
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textTertiary}
                        />
                    )}
                    {renderSettingItem(
                        "shield-check-outline",
                        "Privacy Policy",
                        "Read our privacy policy",
                        () => {},
                        <MaterialCommunityIcons
                            name="open-in-new"
                            size={18}
                            color={colors.textTertiary}
                        />
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text
                        style={[
                            styles.footerText,
                            { color: colors.textTertiary },
                        ]}
                    >
                        Made with ❤️ by Prince Kumar
                    </Text>
                </View>
            </ScrollView>

            {/* Currency Selection Modal */}
            <Modal
                visible={showCurrencyModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCurrencyModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContent,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text
                                style={[
                                    styles.modalTitle,
                                    { color: colors.text },
                                ]}
                            >
                                Select Currency
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowCurrencyModal(false)}
                            >
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {currencies.map((currencyItem) => (
                                <TouchableOpacity
                                    key={currencyItem.code}
                                    style={[
                                        styles.currencyItem,
                                        { borderBottomColor: colors.border },
                                    ]}
                                    onPress={() =>
                                        handleCurrencySelect(currencyItem.code)
                                    }
                                >
                                    <View style={styles.currencyInfo}>
                                        <Text
                                            style={[
                                                styles.currencySymbol,
                                                { color: colors.primary },
                                            ]}
                                        >
                                            {currencyItem.symbol}
                                        </Text>
                                        <View style={styles.currencyText}>
                                            <Text
                                                style={[
                                                    styles.currencyName,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {currencyItem.name}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.currencyCode,
                                                    {
                                                        color: colors.textSecondary,
                                                    },
                                                ]}
                                            >
                                                {currencyItem.code}
                                            </Text>
                                        </View>
                                    </View>
                                    {currency === currencyItem.code && (
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={24}
                                            color={colors.success}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        ...typography.body.medium,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    appInfoCard: {
        borderRadius: 20, // More rounded for modern look
        padding: spacing.xl,
        alignItems: "center",
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    appIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(78, 205, 196, 0.15)", // light teal tint
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    appName: {
        ...typography.heading.h3, // Slightly smaller than h2 for balance
        marginBottom: 2,
    },
    appVersion: {
        ...typography.caption.medium,
    },
    sectionHeader: {
        ...typography.heading.h6,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        fontSize: 12, // smaller, crisp header
    },
    section: {
        borderRadius: 16,
        marginBottom: spacing.md,
        borderWidth: 1,
        overflow: "hidden",
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: "transparent",
        minHeight: 72,
    },
    settingIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.lg,
        flexShrink: 0,
    },
    settingContent: {
        flex: 1,
        marginRight: spacing.md,
        minWidth: 0,
        justifyContent: "center",
    },
    settingTitle: {
        fontSize: 15,
        marginBottom: 4,
        fontWeight: fontWeight.semiBold,
        lineHeight: 20,
    },
    settingDescription: {
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.7,
    },
    settingRight: {
        marginLeft: spacing.md,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: fontWeight.bold,
    },
    footer: {
        paddingVertical: spacing.xl,
        alignItems: "center",
    },
    footerText: {
        ...typography.caption.medium,
        textAlign: "center",
        opacity: 0.6,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "70%",
        paddingBottom: spacing.xl,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(128, 128, 128, 0.1)",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: fontWeight.bold,
    },
    modalScroll: {
        maxHeight: 400,
    },
    currencyItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: spacing.lg,
        borderBottomWidth: 1,
    },
    currencyInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: fontWeight.bold,
        width: 40,
        textAlign: "center",
        marginRight: spacing.md,
    },
    currencyText: {
        flex: 1,
    },
    currencyName: {
        fontSize: 15,
        fontWeight: fontWeight.semiBold,
        marginBottom: 2,
    },
    currencyCode: {
        fontSize: 13,
    },
});

export default SettingsScreen;
