import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { DEFAULT_CURRENCY, getCurrencySymbol } from '../utils/currency';
import { storage } from '../utils/storage';

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  SETTINGS: 'settings',
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  GOALS: 'goals',
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
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
      console.error('Error loading settings:', error);
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
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
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
   * Handle SMS tracking toggle
   */
  const handleSMSTrackingToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable SMS Tracking',
        'This is a mock feature. In a real app, this would request SMS permissions and automatically track transactions from bank SMS messages.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              const updatedSettings = {
                ...settings,
                smsTrackingEnabled: value,
              };
              await saveSettings(updatedSettings);
              Alert.alert(
                'SMS Tracking Enabled',
                'The app will now track transactions from SMS (mock mode)'
              );
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
      'Clear All Data',
      'Are you sure you want to delete all accounts, transactions, goals, and settings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
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
                'Success',
                'All data has been cleared. The app will restart with default settings.'
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear all data');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle export data (mock)
   */
  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This is a mock feature. In a real app, this would export all your data to a JSON file that you can backup or share.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Handle import data (mock)
   */
  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'This is a mock feature. In a real app, this would allow you to import data from a previously exported JSON file.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Render setting item
   */
  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Text style={styles.settingIconText}>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
    </TouchableOpacity>
  );

  /**
   * Render section header
   */
  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <View style={styles.appInfoCard}>
          <Text style={styles.appIcon}>💰</Text>
          <Text style={styles.appName}>MoneyMate</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Your personal finance companion
          </Text>
        </View>

        {/* Features Section */}
        {renderSectionHeader('Features')}
        <View style={styles.section}>
          {renderSettingItem(
            '📱',
            'SMS Transaction Tracking',
            settings.smsTrackingEnabled
              ? 'Automatically track transactions from SMS (Mock)'
              : 'Enable to track bank SMS messages (Mock)',
            undefined,
            <Switch
              value={settings.smsTrackingEnabled}
              onValueChange={handleSMSTrackingToggle}
              trackColor={{
                false: lightColors.muted,
                true: lightColors.primary,
              }}
              thumbColor={lightColors.white}
            />
          )}
        </View>

        {/* Currency Section */}
        {renderSectionHeader('Currency')}
        <View style={styles.section}>
          {renderSettingItem(
            getCurrencySymbol(),
            'Default Currency',
            `${settings.currency} - Indian Rupee`,
            undefined,
            <Text style={styles.currencyCode}>{settings.currency}</Text>
          )}
        </View>

        {/* Data Management Section */}
        {renderSectionHeader('Data Management')}
        <View style={styles.section}>
          {renderSettingItem(
            '📤',
            'Export Data',
            'Backup your data to a file (Mock)',
            handleExportData,
            <Text style={styles.chevron}>›</Text>
          )}
          {renderSettingItem(
            '📥',
            'Import Data',
            'Restore data from a backup file (Mock)',
            handleImportData,
            <Text style={styles.chevron}>›</Text>
          )}
        </View>

        {/* Danger Zone */}
        {renderSectionHeader('Danger Zone')}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearAllData}
            activeOpacity={0.7}
          >
            <View style={styles.dangerButtonContent}>
              <Text style={styles.dangerIcon}>🗑️</Text>
              <View style={styles.dangerTextContainer}>
                <Text style={styles.dangerButtonTitle}>Clear All Data</Text>
                <Text style={styles.dangerButtonDescription}>
                  Delete all accounts, transactions, goals, and settings
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        {renderSectionHeader('About')}
        <View style={styles.section}>
          {renderSettingItem(
            'ℹ️',
            'About MoneyMate',
            'Learn more about this app',
            () => {
              Alert.alert(
                'About MoneyMate',
                'MoneyMate is a personal finance management app that helps you track your accounts, transactions, and savings goals.\n\nBuilt with React Native and TypeScript.',
                [{ text: 'OK' }]
              );
            },
            <Text style={styles.chevron}>›</Text>
          )}
          {renderSettingItem(
            '📄',
            'Privacy Policy',
            'View our privacy policy (Mock)',
            () => {
              Alert.alert(
                'Privacy Policy',
                'This is a mock feature. In a real app, this would show the privacy policy.',
                [{ text: 'OK' }]
              );
            },
            <Text style={styles.chevron}>›</Text>
          )}
          {renderSettingItem(
            '📜',
            'Terms of Service',
            'View terms of service (Mock)',
            () => {
              Alert.alert(
                'Terms of Service',
                'This is a mock feature. In a real app, this would show the terms of service.',
                [{ text: 'OK' }]
              );
            },
            <Text style={styles.chevron}>›</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for better financial management
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body.medium,
    color: lightColors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  appInfoCard: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  appIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  appName: {
    ...typography.heading.h2,
    color: lightColors.text,
    marginBottom: spacing.xs,
  },
  appVersion: {
    ...typography.caption.medium,
    color: lightColors.textSecondary,
    marginBottom: spacing.sm,
  },
  appDescription: {
    ...typography.body.small,
    color: lightColors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    ...typography.heading.h5,
    color: lightColors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: lightColors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.borderLight,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: lightColors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  settingIconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body.medium,
    color: lightColors.text,
    marginBottom: 2,
    fontWeight: typography.fontWeight.medium,
  },
  settingDescription: {
    ...typography.caption.medium,
    color: lightColors.textSecondary,
  },
  settingRight: {
    marginLeft: spacing.sm,
  },
  currencyCode: {
    ...typography.body.medium,
    color: lightColors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  chevron: {
    ...typography.heading.h4,
    color: lightColors.textTertiary,
  },
  dangerButton: {
    padding: spacing.md,
  },
  dangerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  dangerTextContainer: {
    flex: 1,
  },
  dangerButtonTitle: {
    ...typography.body.medium,
    color: lightColors.danger,
    marginBottom: 2,
    fontWeight: typography.fontWeight.semiBold,
  },
  dangerButtonDescription: {
    ...typography.caption.medium,
    color: lightColors.textSecondary,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption.medium,
    color: lightColors.textTertiary,
    textAlign: 'center',
  },
});

export default SettingsScreen;
