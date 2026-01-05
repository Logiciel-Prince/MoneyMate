import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";
import { fontWeight, typography } from "../theme/typography";
import {
    CustomCategory,
    DEFAULT_EXPENSE_CATEGORIES,
    DEFAULT_INCOME_CATEGORIES,
} from "../types/Category";
import { storage } from "../utils/storage";

const STORAGE_KEYS = {
    CATEGORIES: "custom_categories",
};

export const ManageCategoriesScreen: React.FC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [categories, setCategories] = useState<CustomCategory[]>([]);
    const [filter, setFilter] = useState<"income" | "expense">("expense");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("tag");

    // Available icons for categories
    const availableIcons = [
        "tag",
        "cash",
        "credit-card",
        "wallet",
        "food",
        "coffee",
        "cart",
        "car",
        "bus",
        "airplane",
        "home",
        "office-building",
        "school",
        "hospital",
        "shopping",
        "gift",
        "movie",
        "music",
        "gamepad",
        "dumbbell",
        "book",
        "laptop",
        "phone",
        "chart-line",
        "piggy-bank",
    ];

    // Load categories
    const loadCategories = useCallback(async () => {
        try {
            const stored = await storage.getData<CustomCategory[]>(STORAGE_KEYS.CATEGORIES);
            if (stored && stored.length > 0) {
                setCategories(stored);
            } else {
                // Initialize with default categories
                const defaultCategories = [
                    ...DEFAULT_INCOME_CATEGORIES,
                    ...DEFAULT_EXPENSE_CATEGORIES,
                ];
                await storage.saveData(STORAGE_KEYS.CATEGORIES, defaultCategories);
                setCategories(defaultCategories);
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const filteredCategories = categories.filter((cat) => cat.type === filter);

    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert("Error", "Please enter a category name");
            return;
        }

        const newCategory: CustomCategory = {
            id: Date.now().toString(),
            name: categoryName.trim(),
            type: filter,
            icon: selectedIcon,
            color: filter === "income" ? "#10B981" : "#EF4444",
            isDefault: false,
            createdAt: new Date(),
        };

        const updatedCategories = [...categories, newCategory];
        await storage.saveData(STORAGE_KEYS.CATEGORIES, updatedCategories);
        setCategories(updatedCategories);
        resetModal();
    };

    const handleEditCategory = async () => {
        if (!categoryName.trim() || !editingCategory) {
            Alert.alert("Error", "Please enter a category name");
            return;
        }

        const updatedCategories = categories.map((cat) =>
            cat.id === editingCategory.id
                ? { ...cat, name: categoryName.trim(), icon: selectedIcon }
                : cat
        );

        await storage.saveData(STORAGE_KEYS.CATEGORIES, updatedCategories);
        setCategories(updatedCategories);
        resetModal();
    };

    const handleDeleteCategory = async (category: CustomCategory) => {
        if (category.isDefault) {
            Alert.alert("Cannot Delete", "Default categories cannot be deleted");
            return;
        }

        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${category.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const updatedCategories = categories.filter(
                            (cat) => cat.id !== category.id
                        );
                        await storage.saveData(STORAGE_KEYS.CATEGORIES, updatedCategories);
                        setCategories(updatedCategories);
                    },
                },
            ]
        );
    };

    const openEditModal = (category: CustomCategory) => {
        if (category.isDefault) {
            Alert.alert("Cannot Edit", "Default categories cannot be edited");
            return;
        }
        setEditingCategory(category);
        setCategoryName(category.name);
        setSelectedIcon(category.icon || "tag");
        setShowAddModal(true);
    };

    const resetModal = () => {
        setShowAddModal(false);
        setEditingCategory(null);
        setCategoryName("");
        setSelectedIcon("tag");
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Manage Categories</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowAddModal(true)}
                >
                    <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filter === "expense" && {
                            backgroundColor: colors.danger,
                            borderColor: colors.danger,
                        },
                    ]}
                    onPress={() => setFilter("expense")}
                >
                    <MaterialCommunityIcons
                        name="arrow-up-circle"
                        size={20}
                        color={filter === "expense" ? colors.white : colors.danger}
                    />
                    <Text
                        style={[
                            styles.filterTabText,
                            filter === "expense" && { color: colors.white },
                            filter !== "expense" && { color: colors.danger },
                        ]}
                    >
                        Expense
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filter === "income" && {
                            backgroundColor: colors.success,
                            borderColor: colors.success,
                        },
                    ]}
                    onPress={() => setFilter("income")}
                >
                    <MaterialCommunityIcons
                        name="arrow-down-circle"
                        size={20}
                        color={filter === "income" ? colors.white : colors.success}
                    />
                    <Text
                        style={[
                            styles.filterTabText,
                            filter === "income" && { color: colors.white },
                            filter !== "income" && { color: colors.success },
                        ]}
                    >
                        Income
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Categories List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {filteredCategories.map((category) => (
                    <View key={category.id} style={styles.categoryItem}>
                        <View style={styles.categoryInfo}>
                            <View
                                style={[
                                    styles.iconContainer,
                                    {
                                        backgroundColor:
                                            filter === "income"
                                                ? `${colors.success}20`
                                                : `${colors.danger}20`,
                                    },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={category.icon as any || "tag"}
                                    size={24}
                                    color={filter === "income" ? colors.success : colors.danger}
                                />
                            </View>
                            <View style={styles.categoryDetails}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <Text style={styles.categoryType}>
                                    {category.isDefault ? "Default" : "Custom"}
                                </Text>
                            </View>
                        </View>

                        {!category.isDefault && (
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => openEditModal(category)}
                                >
                                    <MaterialCommunityIcons
                                        name="pencil"
                                        size={20}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleDeleteCategory(category)}
                                >
                                    <MaterialCommunityIcons
                                        name="delete"
                                        size={20}
                                        color={colors.danger}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={resetModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingCategory ? "Edit Category" : "Add Category"}
                            </Text>
                            <TouchableOpacity onPress={resetModal}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Category Name */}
                            <View style={styles.inputSection}>
                                <Text style={styles.label}>Category Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={categoryName}
                                    onChangeText={setCategoryName}
                                    placeholder="Enter category name"
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>

                            {/* Icon Selection */}
                            <View style={styles.inputSection}>
                                <Text style={styles.label}>Select Icon</Text>
                                <View style={styles.iconGrid}>
                                    {availableIcons.map((icon) => (
                                        <TouchableOpacity
                                            key={icon}
                                            style={[
                                                styles.iconOption,
                                                selectedIcon === icon && {
                                                    backgroundColor: colors.primary,
                                                },
                                            ]}
                                            onPress={() => setSelectedIcon(icon)}
                                        >
                                            <MaterialCommunityIcons
                                                name={icon as any}
                                                size={24}
                                                color={
                                                    selectedIcon === icon
                                                        ? colors.white
                                                        : colors.text
                                                }
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={resetModal}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={
                                        editingCategory ? handleEditCategory : handleAddCategory
                                    }
                                >
                                    <Text style={styles.saveButtonText}>
                                        {editingCategory ? "Update" : "Add"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            ...typography.heading.h2,
            color: colors.text,
            fontSize: 24,
            fontWeight: fontWeight.bold,
        },
        addButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
        },
        filterContainer: {
            flexDirection: "row",
            padding: spacing.lg,
            gap: spacing.md,
        },
        filterTab: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            borderColor: colors.border,
            gap: spacing.xs,
        },
        filterTabText: {
            ...typography.body.medium,
            fontWeight: fontWeight.semiBold,
        },
        content: {
            flex: 1,
            padding: spacing.lg,
        },
        categoryItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.surface,
            padding: spacing.md,
            borderRadius: borderRadius.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        categoryInfo: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: borderRadius.full,
            alignItems: "center",
            justifyContent: "center",
            marginRight: spacing.md,
        },
        categoryDetails: {
            flex: 1,
        },
        categoryName: {
            ...typography.body.medium,
            color: colors.text,
            fontSize: 16,
            fontWeight: fontWeight.semiBold,
        },
        categoryType: {
            ...typography.caption.small,
            color: colors.textSecondary,
            fontSize: 13,
            marginTop: 2,
        },
        actions: {
            flexDirection: "row",
            gap: spacing.sm,
        },
        actionButton: {
            padding: spacing.sm,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
        },
        modalContent: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            maxHeight: "80%",
            paddingBottom: spacing.xl,
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
            ...typography.heading.h3,
            color: colors.text,
            fontSize: 20,
            fontWeight: fontWeight.bold,
        },
        inputSection: {
            padding: spacing.lg,
        },
        label: {
            ...typography.body.medium,
            color: colors.text,
            marginBottom: spacing.sm,
            fontSize: 14,
            fontWeight: fontWeight.semiBold,
        },
        input: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            color: colors.text,
            fontSize: 16,
        },
        iconGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.sm,
        },
        iconOption: {
            width: 48,
            height: 48,
            borderRadius: borderRadius.md,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
        },
        modalActions: {
            flexDirection: "row",
            gap: spacing.md,
            padding: spacing.lg,
        },
        modalButton: {
            flex: 1,
            padding: spacing.md,
            borderRadius: borderRadius.md,
            alignItems: "center",
            minHeight: 48,
        },
        cancelButton: {
            backgroundColor: colors.background,
            borderWidth: 2,
            borderColor: colors.border,
        },
        cancelButtonText: {
            ...typography.body.medium,
            color: colors.text,
            fontWeight: fontWeight.semiBold,
        },
        saveButton: {
            backgroundColor: colors.primary,
        },
        saveButtonText: {
            ...typography.body.medium,
            color: colors.white,
            fontWeight: fontWeight.bold,
        },
    });

export default ManageCategoriesScreen;
