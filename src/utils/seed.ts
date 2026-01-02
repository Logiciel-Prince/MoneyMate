import { Account, AccountType } from '../types/Account';
import { Goal } from '../types/Goal';
import { Transaction, TransactionCategory, TransactionType } from '../types/Transaction';
import { storage } from './storage';

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  GOALS: 'goals',
  SEEDED: 'data_seeded',
};

/**
 * Generate mock accounts
 */
const generateMockAccounts = (): Account[] => {
  return [
    {
      id: 'account-1',
      name: 'Main Savings',
      type: AccountType.SAVINGS,
      balance: 0, // Will be calculated from transactions
    },
    {
      id: 'account-2',
      name: 'Salary Account',
      type: AccountType.CHECKING,
      balance: 0,
    },
    {
      id: 'account-3',
      name: 'Credit Card',
      type: AccountType.CREDIT_CARD,
      balance: 0,
    },
    {
      id: 'account-4',
      name: 'Cash Wallet',
      type: AccountType.CASH,
      balance: 0,
    },
  ];
};

/**
 * Generate mock transactions
 */
const generateMockTransactions = (): Transaction[] => {
  const now = new Date();
  const transactions: Transaction[] = [];

  // Helper to create date X days ago
  const daysAgo = (days: number): Date => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  };

  // Salary credits (monthly)
  transactions.push(
    {
      id: 'txn-1',
      accountId: 'account-2',
      title: 'Salary Credit',
      amount: 75000,
      type: TransactionType.CREDIT,
      category: TransactionCategory.SALARY,
      date: daysAgo(25),
    },
    {
      id: 'txn-2',
      accountId: 'account-2',
      title: 'Salary Credit',
      amount: 75000,
      type: TransactionType.CREDIT,
      category: TransactionCategory.SALARY,
      date: daysAgo(55),
    }
  );

  // Savings transfers
  transactions.push(
    {
      id: 'txn-3',
      accountId: 'account-1',
      title: 'Monthly Savings',
      amount: 20000,
      type: TransactionType.CREDIT,
      category: TransactionCategory.OTHER_INCOME,
      date: daysAgo(24),
    },
    {
      id: 'txn-4',
      accountId: 'account-1',
      title: 'Monthly Savings',
      amount: 20000,
      type: TransactionType.CREDIT,
      category: TransactionCategory.OTHER_INCOME,
      date: daysAgo(54),
    }
  );

  // Food & Dining
  transactions.push(
    {
      id: 'txn-5',
      accountId: 'account-2',
      title: 'Swiggy Order',
      amount: 450,
      type: TransactionType.DEBIT,
      category: TransactionCategory.FOOD,
      date: daysAgo(1),
    },
    {
      id: 'txn-6',
      accountId: 'account-3',
      title: 'Restaurant Dinner',
      amount: 1200,
      type: TransactionType.DEBIT,
      category: TransactionCategory.FOOD,
      date: daysAgo(3),
    },
    {
      id: 'txn-7',
      accountId: 'account-4',
      title: 'Coffee Shop',
      amount: 250,
      type: TransactionType.DEBIT,
      category: TransactionCategory.FOOD,
      date: daysAgo(2),
    },
    {
      id: 'txn-8',
      accountId: 'account-2',
      title: 'Zomato Order',
      amount: 380,
      type: TransactionType.DEBIT,
      category: TransactionCategory.FOOD,
      date: daysAgo(5),
    }
  );

  // Shopping
  transactions.push(
    {
      id: 'txn-9',
      accountId: 'account-3',
      title: 'Amazon Purchase',
      amount: 2500,
      type: TransactionType.DEBIT,
      category: TransactionCategory.SHOPPING,
      date: daysAgo(7),
    },
    {
      id: 'txn-10',
      accountId: 'account-2',
      title: 'Myntra Shopping',
      amount: 1800,
      type: TransactionType.DEBIT,
      category: TransactionCategory.SHOPPING,
      date: daysAgo(12),
    },
    {
      id: 'txn-11',
      accountId: 'account-3',
      title: 'Flipkart Order',
      amount: 3200,
      type: TransactionType.DEBIT,
      category: TransactionCategory.SHOPPING,
      date: daysAgo(15),
    }
  );

  // Transport
  transactions.push(
    {
      id: 'txn-12',
      accountId: 'account-2',
      title: 'Uber Ride',
      amount: 180,
      type: TransactionType.DEBIT,
      category: TransactionCategory.TRANSPORT,
      date: daysAgo(1),
    },
    {
      id: 'txn-13',
      accountId: 'account-4',
      title: 'Metro Recharge',
      amount: 500,
      type: TransactionType.DEBIT,
      category: TransactionCategory.TRANSPORT,
      date: daysAgo(8),
    },
    {
      id: 'txn-14',
      accountId: 'account-2',
      title: 'Petrol',
      amount: 2000,
      type: TransactionType.DEBIT,
      category: TransactionCategory.TRANSPORT,
      date: daysAgo(10),
    }
  );

  // Entertainment
  transactions.push(
    {
      id: 'txn-15',
      accountId: 'account-3',
      title: 'Netflix Subscription',
      amount: 649,
      type: TransactionType.DEBIT,
      category: TransactionCategory.ENTERTAINMENT,
      date: daysAgo(5),
    },
    {
      id: 'txn-16',
      accountId: 'account-2',
      title: 'Movie Tickets',
      amount: 600,
      type: TransactionType.DEBIT,
      category: TransactionCategory.ENTERTAINMENT,
      date: daysAgo(14),
    },
    {
      id: 'txn-17',
      accountId: 'account-3',
      title: 'Spotify Premium',
      amount: 119,
      type: TransactionType.DEBIT,
      category: TransactionCategory.ENTERTAINMENT,
      date: daysAgo(6),
    }
  );

  // Bills & Utilities
  transactions.push(
    {
      id: 'txn-18',
      accountId: 'account-2',
      title: 'Electricity Bill',
      amount: 1500,
      type: TransactionType.DEBIT,
      category: TransactionCategory.BILLS,
      date: daysAgo(20),
    },
    {
      id: 'txn-19',
      accountId: 'account-2',
      title: 'Internet Bill',
      amount: 999,
      type: TransactionType.DEBIT,
      category: TransactionCategory.BILLS,
      date: daysAgo(18),
    },
    {
      id: 'txn-20',
      accountId: 'account-2',
      title: 'Mobile Recharge',
      amount: 399,
      type: TransactionType.DEBIT,
      category: TransactionCategory.BILLS,
      date: daysAgo(4),
    }
  );

  // Groceries
  transactions.push(
    {
      id: 'txn-21',
      accountId: 'account-2',
      title: 'DMart Shopping',
      amount: 2500,
      type: TransactionType.DEBIT,
      category: TransactionCategory.GROCERIES,
      date: daysAgo(6),
    },
    {
      id: 'txn-22',
      accountId: 'account-4',
      title: 'Local Grocery Store',
      amount: 800,
      type: TransactionType.DEBIT,
      category: TransactionCategory.GROCERIES,
      date: daysAgo(3),
    },
    {
      id: 'txn-23',
      accountId: 'account-2',
      title: 'BigBasket Order',
      amount: 1200,
      type: TransactionType.DEBIT,
      category: TransactionCategory.GROCERIES,
      date: daysAgo(13),
    }
  );

  // Rent
  transactions.push(
    {
      id: 'txn-24',
      accountId: 'account-2',
      title: 'House Rent',
      amount: 15000,
      type: TransactionType.DEBIT,
      category: TransactionCategory.RENT,
      date: daysAgo(22),
    },
    {
      id: 'txn-25',
      accountId: 'account-2',
      title: 'House Rent',
      amount: 15000,
      type: TransactionType.DEBIT,
      category: TransactionCategory.RENT,
      date: daysAgo(52),
    }
  );

  // Healthcare
  transactions.push(
    {
      id: 'txn-26',
      accountId: 'account-2',
      title: 'Pharmacy',
      amount: 450,
      type: TransactionType.DEBIT,
      category: TransactionCategory.HEALTHCARE,
      date: daysAgo(9),
    },
    {
      id: 'txn-27',
      accountId: 'account-3',
      title: 'Doctor Consultation',
      amount: 800,
      type: TransactionType.DEBIT,
      category: TransactionCategory.HEALTHCARE,
      date: daysAgo(16),
    }
  );

  // Freelance income
  transactions.push(
    {
      id: 'txn-28',
      accountId: 'account-2',
      title: 'Freelance Project',
      amount: 15000,
      type: TransactionType.CREDIT,
      category: TransactionCategory.FREELANCE,
      date: daysAgo(11),
    }
  );

  // Gift
  transactions.push(
    {
      id: 'txn-29',
      accountId: 'account-4',
      title: 'Birthday Gift Received',
      amount: 5000,
      type: TransactionType.CREDIT,
      category: TransactionCategory.GIFT,
      date: daysAgo(30),
    }
  );

  // Misc expenses
  transactions.push(
    {
      id: 'txn-30',
      accountId: 'account-4',
      title: 'ATM Withdrawal',
      amount: 3000,
      type: TransactionType.DEBIT,
      category: TransactionCategory.OTHER_EXPENSE,
      date: daysAgo(7),
    }
  );

  return transactions;
};

/**
 * Generate mock goals
 */
const generateMockGoals = (): Goal[] => {
  const now = new Date();

  return [
    {
      id: 'goal-1',
      name: 'Emergency Fund',
      targetAmount: 100000,
      savedAmount: 45000,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 1),
    },
    {
      id: 'goal-2',
      name: 'Vacation to Goa',
      targetAmount: 50000,
      savedAmount: 18000,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 15),
    },
    {
      id: 'goal-3',
      name: 'New Laptop',
      targetAmount: 80000,
      savedAmount: 65000,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
    },
    {
      id: 'goal-4',
      name: 'Investment Fund',
      targetAmount: 200000,
      savedAmount: 50000,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 4, 5),
    },
  ];
};

/**
 * Check if data has been seeded
 */
export const isDataSeeded = async (): Promise<boolean> => {
  try {
    const seeded = await storage.getData<boolean>(STORAGE_KEYS.SEEDED);
    return seeded === true;
  } catch (error) {
    console.error('Error checking seed status:', error);
    return false;
  }
};

/**
 * Seed initial data if storage is empty
 */
export const seedDataIfNeeded = async (): Promise<void> => {
  try {
    // Check if already seeded
    const alreadySeeded = await isDataSeeded();
    if (alreadySeeded) {
      console.log('Data already seeded, skipping...');
      return;
    }

    // Check if any data exists
    const [existingAccounts, existingTransactions, existingGoals] = await Promise.all([
      storage.getData<Account[]>(STORAGE_KEYS.ACCOUNTS),
      storage.getData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS),
      storage.getData<Goal[]>(STORAGE_KEYS.GOALS),
    ]);

    // If any data exists, don't seed
    if (existingAccounts || existingTransactions || existingGoals) {
      console.log('Existing data found, skipping seed...');
      await storage.saveData(STORAGE_KEYS.SEEDED, true);
      return;
    }

    console.log('Seeding initial data...');

    // Generate mock data
    const accounts = generateMockAccounts();
    const transactions = generateMockTransactions();
    const goals = generateMockGoals();

    // Save to storage
    await Promise.all([
      storage.saveData(STORAGE_KEYS.ACCOUNTS, accounts),
      storage.saveData(STORAGE_KEYS.TRANSACTIONS, transactions),
      storage.saveData(STORAGE_KEYS.GOALS, goals),
      storage.saveData(STORAGE_KEYS.SEEDED, true),
    ]);

    console.log('Initial data seeded successfully!');
    console.log(`- ${accounts.length} accounts`);
    console.log(`- ${transactions.length} transactions`);
    console.log(`- ${goals.length} goals`);
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

/**
 * Clear seed flag (for testing)
 */
export const clearSeedFlag = async (): Promise<void> => {
  try {
    await storage.removeData(STORAGE_KEYS.SEEDED);
    console.log('Seed flag cleared');
  } catch (error) {
    console.error('Error clearing seed flag:', error);
  }
};

/**
 * Reset all data and reseed
 */
export const resetAndReseed = async (): Promise<void> => {
  try {
    // Clear all data
    await Promise.all([
      storage.removeData(STORAGE_KEYS.ACCOUNTS),
      storage.removeData(STORAGE_KEYS.TRANSACTIONS),
      storage.removeData(STORAGE_KEYS.GOALS),
      storage.removeData(STORAGE_KEYS.SEEDED),
    ]);

    // Reseed
    await seedDataIfNeeded();

    console.log('Data reset and reseeded successfully!');
  } catch (error) {
    console.error('Error resetting and reseeding:', error);
    throw error;
  }
};
