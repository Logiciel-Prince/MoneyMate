import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { fontSize, fontWeight } from '../theme/typography';

interface MenuItem {
    id: string;
    title: string;
    subtitle: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    screen: string;
}

export const MoreScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    const menuItems: MenuItem[] = [
        {
            id: "budgets",
            title: "My Budgets",
            subtitle: "Track and manage your budgets",
            icon: "timer-sand",
            color: "#8B5CF6",
            screen: "Budgets",
        },
        {
            id: "goals",
            title: "Savings Goals",
            subtitle: "Set and achieve your financial goals",
            icon: "rocket",
            color: "#10B981",
            screen: "Goals",
        },
        {
            id: "categories",
            title: "Categories",
            subtitle: "Customize transaction categories",
            icon: "tag-multiple",
            color: "#F59E0B",
            screen: "ManageCategories",
        },
        {
            id: "settings",
            title: "Settings",
            subtitle: "App preferences and configuration",
            icon: "cog",
            color: "#6B7280",
            screen: "Settings",
        },
    ];

    const handleMenuPress = (screen: string) => {
        navigation.navigate(screen);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                                index === menuItems.length - 1 && styles.lastMenuItem,
                            ]}
                            onPress={() => handleMenuPress(item.screen)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: item.color + '20' },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={item.icon}
                                    size={24}
                                    color={item.color}
                                />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={[styles.menuTitle, { color: colors.text }]}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                                    {item.subtitle}
                                </Text>
                            </View>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={24}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
                        MoneyMate v1.0.0
                    </Text>
                    <Text style={[styles.appInfoText, { color: colors.textTertiary }]}>
                        Your Personal Finance Manager
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    menuSection: {
        marginBottom: spacing.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 16,
        marginBottom: spacing.md,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    lastMenuItem: {
        marginBottom: 0,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semiBold,
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: fontSize.sm,
        lineHeight: 18,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: spacing.xl,
        paddingTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.1)',
    },
    appInfoText: {
        fontSize: fontSize.sm,
        marginBottom: 4,
    },
});

export default MoreScreen;
