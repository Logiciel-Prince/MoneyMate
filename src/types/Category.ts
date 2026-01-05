/**
 * Custom category interface for user-defined categories
 */
export interface CustomCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
    isDefault: boolean;
    createdAt: Date;
}

/**
 * Default income categories
 */
export const DEFAULT_INCOME_CATEGORIES: CustomCategory[] = [
    {
        id: 'salary',
        name: 'Salary',
        type: 'income',
        icon: 'cash',
        color: '#10B981',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'freelance',
        name: 'Freelance',
        type: 'income',
        icon: 'laptop',
        color: '#10B981',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'investment',
        name: 'Investment',
        type: 'income',
        icon: 'chart-line',
        color: '#10B981',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'gift',
        name: 'Gift',
        type: 'income',
        icon: 'gift',
        color: '#10B981',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'refund',
        name: 'Refund',
        type: 'income',
        icon: 'cash-refund',
        color: '#10B981',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'other_income',
        name: 'Other Income',
        type: 'income',
        icon: 'dots-horizontal',
        color: '#10B981',
        isDefault: true,
        createdAt: new Date(),
    },
];

/**
 * Default expense categories
 */
export const DEFAULT_EXPENSE_CATEGORIES: CustomCategory[] = [
    {
        id: 'food',
        name: 'Food',
        type: 'expense',
        icon: 'food',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'transport',
        name: 'Transport',
        type: 'expense',
        icon: 'car',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'shopping',
        name: 'Shopping',
        type: 'expense',
        icon: 'shopping',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        type: 'expense',
        icon: 'movie',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'bills',
        name: 'Bills',
        type: 'expense',
        icon: 'file-document',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'healthcare',
        name: 'Healthcare',
        type: 'expense',
        icon: 'hospital',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'education',
        name: 'Education',
        type: 'expense',
        icon: 'school',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'travel',
        name: 'Travel',
        type: 'expense',
        icon: 'airplane',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'groceries',
        name: 'Groceries',
        type: 'expense',
        icon: 'cart',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'utilities',
        name: 'Utilities',
        type: 'expense',
        icon: 'lightning-bolt',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'rent',
        name: 'Rent',
        type: 'expense',
        icon: 'home',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
    {
        id: 'other_expense',
        name: 'Other Expense',
        type: 'expense',
        icon: 'dots-horizontal',
        color: '#EF4444',
        isDefault: true,
        createdAt: new Date(),
    },
];

/**
 * Get all default categories
 */
export const getAllDefaultCategories = (): CustomCategory[] => {
    return [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
};
