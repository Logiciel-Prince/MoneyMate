import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ConfirmDialog } from "../components/ConfirmDialog";
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
    const navigation = useNavigation<any>();
    const { colors, isDark, toggleTheme } = useTheme();
    const { currency, setCurrency: updateCurrency } = useCurrency();
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [showClearDataDialog, setShowClearDataDialog] = useState(false);
    const [showLoadDemoDialog, setShowLoadDemoDialog] = useState(false);

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
     * Handle export data
     */
    const handleExportData = async () => {
        try {
            const [accounts, transactions, goals, settings] = await Promise.all(
                [
                    storage.getData(STORAGE_KEYS.ACCOUNTS),
                    storage.getData(STORAGE_KEYS.TRANSACTIONS),
                    storage.getData(STORAGE_KEYS.GOALS),
                    storage.getData(STORAGE_KEYS.SETTINGS),
                ]
            );

            const exportData = {
                version: "1.0.0",
                exportDate: new Date().toISOString(),
                data: {
                    accounts: accounts || [],
                    transactions: transactions || [],
                    goals: goals || [],
                    settings: settings || DEFAULT_SETTINGS,
                },
            };

            const jsonString = JSON.stringify(exportData, null, 2);

            // For web: Download as file
            if (typeof window !== "undefined" && window.document) {
                const blob = new Blob([jsonString], {
                    type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `moneymate-backup-${
                    new Date().toISOString().split("T")[0]
                }.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                Alert.alert("Success", "Data exported successfully!");
            } else {
                // For mobile: Show the JSON (you can implement file sharing here)
                Alert.alert(
                    "Export Data",
                    "Data export feature will be fully available in the next update. For now, your data is ready to be exported.",
                    [{ text: "OK" }]
                );
            }
        } catch (error) {
            console.error("Error exporting data:", error);
            Alert.alert("Error", "Failed to export data");
        }
    };

    /**
     * Handle import data
     */
    const handleImportData = () => {
        console.log("Import Data clicked");

        // For web: File input
        if (typeof window !== "undefined" && window.document) {
            console.log("Creating file input");
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";
            input.onchange = async (e: any) => {
                console.log("File selected");
                try {
                    const file = e.target.files[0];
                    if (!file) {
                        console.log("No file selected");
                        return;
                    }

                    console.log("Reading file:", file.name);
                    const text = await file.text();
                    const importData = JSON.parse(text);

                    if (!importData.data) {
                        Alert.alert("Error", "Invalid backup file format");
                        return;
                    }

                    // Confirm before importing
                    Alert.alert(
                        "Confirm Import",
                        `Import data from ${file.name}? This will replace all existing data.`,
                        [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Import",
                                onPress: async () => {
                                    try {
                                        console.log("Importing data...");
                                        // Import data
                                        await Promise.all([
                                            storage.saveData(
                                                STORAGE_KEYS.ACCOUNTS,
                                                importData.data.accounts || []
                                            ),
                                            storage.saveData(
                                                STORAGE_KEYS.TRANSACTIONS,
                                                importData.data.transactions ||
                                                    []
                                            ),
                                            storage.saveData(
                                                STORAGE_KEYS.GOALS,
                                                importData.data.goals || []
                                            ),
                                            storage.saveData(
                                                STORAGE_KEYS.SETTINGS,
                                                importData.data.settings ||
                                                    DEFAULT_SETTINGS
                                            ),
                                        ]);

                                        console.log(
                                            "Data imported successfully"
                                        );
                                        Alert.alert(
                                            "Success",
                                            "Data imported successfully!"
                                        );

                                        // Update settings from imported data if available
                                        if (importData.data.settings) {
                                            setSettings(
                                                importData.data.settings
                                            );
                                        }
                                    } catch (error) {
                                        console.error(
                                            "Error saving imported data:",
                                            error
                                        );
                                        Alert.alert(
                                            "Error",
                                            "Failed to save imported data"
                                        );
                                    }
                                },
                            },
                        ]
                    );
                } catch (error) {
                    console.error("Error reading file:", error);
                    Alert.alert(
                        "Error",
                        "Failed to read file. Please check the file format."
                    );
                }
            };
            console.log("Triggering file input click");
            input.click();
        } else {
            Alert.alert(
                "Import Data",
                "Data import feature will be fully available in the next update.",
                [{ text: "OK" }]
            );
        }
    };

    /**
     * Handle load demo data
     */
    const handleLoadDemoData = () => {
        console.log("Load Demo Data clicked");
        setShowLoadDemoDialog(true);
    };

    const confirmLoadDemoData = async () => {
        setShowLoadDemoDialog(false);

        try {
            console.log("Loading demo data...");
            const { resetAndReseed } = await import("../utils/seed");

            console.log("Resetting and reseeding...");
            await resetAndReseed();

            console.log("Demo data loaded successfully");

            Alert.alert("Success", "Demo data loaded successfully!");
        } catch (error) {
            console.error("Error loading demo data:", error);
            Alert.alert("Error", `Failed to load demo data: ${error}`);
        }
    };

    /**
     * Handle clear all data
     */
    const handleClearAllData = () => {
        console.log("Clear All Data clicked");
        setShowClearDataDialog(true);
    };

    const confirmClearAllData = async () => {
        setShowClearDataDialog(false);

        try {
            console.log("Clearing all data...");
            await Promise.all([
                storage.removeData(STORAGE_KEYS.ACCOUNTS),
                storage.removeData(STORAGE_KEYS.TRANSACTIONS),
                storage.removeData(STORAGE_KEYS.GOALS),
                storage.removeData(STORAGE_KEYS.SETTINGS),
                storage.saveData("data_seeded", true), // Mark as seeded to prevent auto-demo-data on reload
            ]);

            setSettings(DEFAULT_SETTINGS);
            console.log("All data cleared successfully");

            Alert.alert("Success", "All data cleared successfully!");
        } catch (error) {
            console.error("Error clearing data:", error);
            Alert.alert("Error", `Failed to clear data - ${error}`);
        }
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
        isDestructive: boolean = false,
        iconColor?: string,
        isLast: boolean = false
    ) => (
        <TouchableOpacity
            style={[
                styles.settingItem,
                {
                    borderBottomColor: isLast ? "transparent" : colors.border,
                    borderBottomWidth: isLast ? 0 : 1,
                },
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View
                style={[
                    styles.settingIcon,
                    {
                        backgroundColor: isDestructive
                            ? `${colors.danger}15`
                            : iconColor
                            ? `${iconColor}15`
                            : `${colors.primary}15`,
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name={iconName}
                    size={24}
                    color={
                        isDestructive
                            ? colors.danger
                            : iconColor || colors.primary
                    }
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
    const renderSectionHeader = (
        title: string,
        iconName?: keyof typeof MaterialCommunityIcons.glyphMap
    ) => (
        <View style={styles.sectionHeaderContainer}>
            {iconName && (
                <MaterialCommunityIcons
                    name={iconName}
                    size={18}
                    color={colors.textSecondary}
                    style={styles.sectionHeaderIcon}
                />
            )}
            <Text
                style={[styles.sectionHeader, { color: colors.textSecondary }]}
            >
                {title}
            </Text>
        </View>
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
                    <MaterialCommunityIcons
                        name="cog"
                        size={48}
                        color={colors.primary}
                    />
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
                {/* App Info Header */}
                <View
                    style={[
                        styles.appInfoCard,
                        {
                            backgroundColor: colors.surface,
                            shadowColor: colors.text,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.appIconContainer,
                            { backgroundColor: `${colors.primary}15` },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="wallet-outline"
                            size={48}
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
                    <View
                        style={[
                            styles.appTagline,
                            { backgroundColor: `${colors.primary}10` },
                        ]}
                    >
                        <Text
                            style={[
                                styles.appTaglineText,
                                { color: colors.primary },
                            ]}
                        >
                            Your Personal Finance Manager
                        </Text>
                    </View>
                </View>

                {/* Preferences Section */}
                {renderSectionHeader("Preferences", "tune")}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: colors.surface,
                            shadowColor: colors.text,
                        },
                    ]}
                >
                    {renderSettingItem(
                        "theme-light-dark",
                        "Appearance",
                        isDark
                            ? "Dark theme enabled for comfortable viewing"
                            : "Light theme enabled for bright environments",
                        toggleTheme,
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{
                                false: colors.border,
                                true: colors.primary,
                            }}
                            thumbColor={"#FFF"}
                            ios_backgroundColor={colors.border}
                        />,
                        false,
                        colors.primary
                    )}
                    {renderSettingItem(
                        "currency-usd",
                        "Currency",
                        `${
                            currencies.find((c) => c.code === currency)?.name ||
                            "Indian Rupee"
                        } (${
                            currencies.find((c) => c.code === currency)
                                ?.symbol || "₹"
                        })`,
                        () => setShowCurrencyModal(true),
                        <View style={styles.currencyPreview}>
                            <Text
                                style={[
                                    styles.currencyPreviewText,
                                    { color: colors.primary },
                                ]}
                            >
                                {currencies.find((c) => c.code === currency)
                                    ?.symbol || "₹"}
                            </Text>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={colors.textTertiary}
                            />
                        </View>,
                        false,
                        "#10B981"
                    )}
                    {renderSettingItem(
                        "shape",
                        "Categories",
                        "Manage transaction categories",
                        () => navigation.navigate("ManageCategories"),
                        <View style={styles.currencyPreview}>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={colors.textTertiary}
                            />
                        </View>,
                        false,
                        "#8B5CF6"
                    )}
                    {renderSettingItem(
                        "message-processing",
                        "SMS Tracking",
                        settings.smsTrackingEnabled
                            ? "Automatically tracking bank transactions"
                            : "Enable to auto-track banking SMS",
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
                            ios_backgroundColor={colors.border}
                        />,
                        false,
                        "#8B5CF6",
                        true
                    )}
                </View>

                {/* Data Management Section */}
                {renderSectionHeader("Data & Storage", "database")}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: colors.surface,
                            shadowColor: colors.text,
                        },
                    ]}
                >
                    {renderSettingItem(
                        "cloud-upload-outline",
                        "Export Data",
                        "Backup all your financial data securely",
                        handleExportData,
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textTertiary}
                        />,
                        false,
                        "#3B82F6"
                    )}
                    {renderSettingItem(
                        "cloud-download-outline",
                        "Import Data",
                        "Restore your data from a backup file",
                        handleImportData,
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textTertiary}
                        />,
                        false,
                        "#06B6D4"
                    )}
                    {renderSettingItem(
                        "database-plus",
                        "Load Demo Data",
                        "Explore the app with sample transactions",
                        handleLoadDemoData,
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textTertiary}
                        />,
                        false,
                        "#F59E0B",
                        true
                    )}
                </View>

                {/* Danger Zone */}
                {renderSectionHeader("Danger Zone", "alert-circle")}
                <View
                    style={[
                        styles.section,
                        styles.dangerSection,
                        {
                            backgroundColor: colors.surface,
                            shadowColor: colors.danger,
                            borderColor: `${colors.danger}30`,
                        },
                    ]}
                >
                    {renderSettingItem(
                        "delete-sweep",
                        "Clear All Data",
                        "Permanently delete all accounts, transactions & goals",
                        handleClearAllData,
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.danger}
                        />,
                        true,
                        colors.danger,
                        true
                    )}
                </View>

                {/* About Section */}
                {renderSectionHeader("About", "information")}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: colors.surface,
                            shadowColor: colors.text,
                        },
                    ]}
                >
                    {renderSettingItem(
                        "information-outline",
                        "About MoneyMate",
                        "Learn more about this application",
                        () =>
                            Alert.alert(
                                "MoneyMate",
                                "Personal Finance Manager\nVersion 1.0.0\n\nManage your finances with ease and confidence."
                            ),
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={colors.textTertiary}
                        />,
                        false,
                        "#6366F1"
                    )}
                    {renderSettingItem(
                        "shield-check-outline",
                        "Privacy Policy",
                        "Your data privacy is our priority",
                        () =>
                            Alert.alert(
                                "Privacy Policy",
                                "All your data is stored locally on your device. We do not collect or share any personal information."
                            ),
                        <MaterialCommunityIcons
                            name="open-in-new"
                            size={18}
                            color={colors.textTertiary}
                        />,
                        false,
                        "#10B981"
                    )}
                    {renderSettingItem(
                        "file-document-outline",
                        "Terms of Service",
                        "Review our terms and conditions",
                        () =>
                            Alert.alert(
                                "Terms of Service",
                                "By using MoneyMate, you agree to use the app responsibly for personal finance management."
                            ),
                        <MaterialCommunityIcons
                            name="open-in-new"
                            size={18}
                            color={colors.textTertiary}
                        />,
                        false,
                        "#8B5CF6",
                        true
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerDivider} />
                    <Text
                        style={[
                            styles.footerText,
                            { color: colors.textTertiary },
                        ]}
                    >
                        Made with ❤️ by Prince Kumar
                    </Text>
                    <Text
                        style={[
                            styles.footerSubtext,
                            { color: colors.textTertiary },
                        ]}
                    >
                        © 2026 MoneyMate. All rights reserved.
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

            {/* Load Demo Data Confirmation Dialog */}
            <ConfirmDialog
                visible={showLoadDemoDialog}
                title="Load Demo Data"
                message="This will load sample data for testing. Your existing data will be replaced. Continue?"
                confirmText="Load Demo"
                cancelText="Cancel"
                onConfirm={confirmLoadDemoData}
                onCancel={() => setShowLoadDemoDialog(false)}
                icon="database"
            />

            {/* Clear All Data Confirmation Dialog */}
            <ConfirmDialog
                visible={showClearDataDialog}
                title="Clear All Data"
                message="Are you sure? This will delete all accounts, transactions, and goals. This cannot be undone."
                confirmText="Clear All"
                cancelText="Cancel"
                onConfirm={confirmClearAllData}
                onCancel={() => setShowClearDataDialog(false)}
                isDangerous
                icon="delete-alert"
            />
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
        gap: spacing.md,
    },
    loadingText: {
        ...typography.body.medium,
        marginTop: spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl * 2,
    },
    // App Info Card
    appInfoCard: {
        borderRadius: 24,
        padding: spacing.xl,
        alignItems: "center",
        marginBottom: spacing.xl,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    appIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    appName: {
        ...typography.heading.h4,
        marginBottom: spacing.xs,
        fontWeight: fontWeight.bold,
    },
    appVersion: {
        ...typography.caption.medium,
        marginBottom: spacing.md,
    },
    appTagline: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        marginTop: spacing.xs,
    },
    appTaglineText: {
        fontSize: 13,
        fontWeight: fontWeight.medium,
        letterSpacing: 0.3,
    },
    // Section Header
    sectionHeaderContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    sectionHeaderIcon: {
        marginRight: spacing.xs,
    },
    sectionHeader: {
        ...typography.heading.h6,
        textTransform: "uppercase",
        letterSpacing: 1,
        fontSize: 12,
        fontWeight: fontWeight.bold,
    },
    // Section Container
    section: {
        borderRadius: 20,
        marginBottom: spacing.lg,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    dangerSection: {
        borderWidth: 1.5,
    },
    // Setting Item
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.lg,
        minHeight: 80,
    },
    settingIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
        flexShrink: 0,
    },
    settingContent: {
        flex: 1,
        marginRight: spacing.md,
        minWidth: 0,
        justifyContent: "center",
    },
    settingTitle: {
        fontSize: 16,
        marginBottom: 6,
        fontWeight: fontWeight.semiBold,
        lineHeight: 22,
    },
    settingDescription: {
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.8,
    },
    settingRight: {
        marginLeft: spacing.sm,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    // Currency Preview
    currencyPreview: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    currencyPreviewText: {
        fontSize: 20,
        fontWeight: fontWeight.bold,
    },
    // Footer
    footer: {
        paddingVertical: spacing.xl,
        alignItems: "center",
        marginTop: spacing.lg,
    },
    footerDivider: {
        width: 60,
        height: 3,
        backgroundColor: "rgba(128, 128, 128, 0.2)",
        borderRadius: 2,
        marginBottom: spacing.lg,
    },
    footerText: {
        ...typography.caption.medium,
        textAlign: "center",
        opacity: 0.7,
        marginBottom: spacing.xs,
    },
    footerSubtext: {
        ...typography.caption.small,
        textAlign: "center",
        opacity: 0.5,
        fontSize: 11,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: "75%",
        paddingBottom: spacing.xl,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: spacing.xl,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(128, 128, 128, 0.1)",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.3,
    },
    modalScroll: {
        maxHeight: 450,
    },
    currencyItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 0.5,
        minHeight: 70,
    },
    currencyInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    currencySymbol: {
        fontSize: 28,
        fontWeight: fontWeight.bold,
        width: 50,
        textAlign: "center",
        marginRight: spacing.md,
    },
    currencyText: {
        flex: 1,
    },
    currencyName: {
        fontSize: 16,
        fontWeight: fontWeight.semiBold,
        marginBottom: 4,
        lineHeight: 20,
    },
    currencyCode: {
        fontSize: 13,
        opacity: 0.7,
    },
});

export default SettingsScreen;
