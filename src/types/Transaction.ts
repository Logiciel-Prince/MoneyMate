/**
 * Transaction type enumeration
 */
export enum TransactionType {
    CREDIT = "credit",
    DEBIT = "debit",
    TRANSFER = "transfer",
}

/**
 * Transaction category enumeration
 */
export enum TransactionCategory {
    // Income categories (for CREDIT transactions)
    SALARY = "salary",
    FREELANCE = "freelance",
    INVESTMENT = "investment",
    GIFT = "gift",
    REFUND = "refund",
    OTHER_INCOME = "other_income",

    // Expense categories (for DEBIT transactions)
    FOOD = "food",
    TRANSPORT = "transport",
    SHOPPING = "shopping",
    ENTERTAINMENT = "entertainment",
    BILLS = "bills",
    HEALTHCARE = "healthcare",
    EDUCATION = "education",
    TRAVEL = "travel",
    GROCERIES = "groceries",
    UTILITIES = "utilities",
    RENT = "rent",
    OTHER_EXPENSE = "other_expense",
}

/**
 * Transaction interface
 */
export interface Transaction {
    /**
     * Unique identifier for the transaction
     */
    id: string;

    /**
     * ID of the account this transaction belongs to
     */
    accountId: string;

    /**
     * Title or description of the transaction
     */
    title: string;

    /**
     * Transaction amount (positive number)
     */
    amount: number;

    /**
     * Type of transaction (credit, debit, or transfer)
     */
    type: TransactionType;

    /**
     * Category of the transaction (ID of the category)
     */
    category: string;

    /**
     * Date when the transaction occurred
     */
    date: Date;

    /**
     * Optional: ID of the destination account (for transfers)
     */
    toAccountId?: string;

    /**
     * Optional: Additional notes for the transaction
     */
    notes?: string;
}
