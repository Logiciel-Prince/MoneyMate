/**
 * Transaction type enumeration
 */
export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

/**
 * Transaction category enumeration
 */
export enum TransactionCategory {
  // Income categories (for CREDIT transactions)
  SALARY = 'salary',
  FREELANCE = 'freelance',
  INVESTMENT = 'investment',
  GIFT = 'gift',
  REFUND = 'refund',
  OTHER_INCOME = 'other_income',

  // Expense categories (for DEBIT transactions)
  FOOD = 'food',
  TRANSPORT = 'transport',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  BILLS = 'bills',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  TRAVEL = 'travel',
  GROCERIES = 'groceries',
  UTILITIES = 'utilities',
  RENT = 'rent',
  OTHER_EXPENSE = 'other_expense',
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
   * Type of transaction (credit or debit)
   */
  type: TransactionType;

  /**
   * Category of the transaction
   */
  category: TransactionCategory;

  /**
   * Date when the transaction occurred
   */
  date: Date;
}
