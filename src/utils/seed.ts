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
    const transactions: Transaction[] = [];
    const now = new Date();

    // Helper to generate a date for a specific month index (0 = current, 1 = previous, etc.)
    const getDateForMonth = (monthOffset: number, day: number) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - monthOffset);
        date.setDate(day);
        return date;
    };

    // Helper arrays for random data
    const merchantNames: { [key: string]: string[] } = {
        [TransactionCategory.FOOD]: [
            "McDonalds",
            "Starbucks",
            "Subway",
            "Local Cafe",
            "Pizza Hut",
            "Dominos",
        ],
        [TransactionCategory.GROCERIES]: [
            "Walmart",
            "Costco",
            "Local Market",
            "Whole Foods",
            "Target",
        ],
        [TransactionCategory.TRANSPORT]: [
            "Uber",
            "Lyft",
            "Gas Station",
            "Subway Ticket",
            "Bus Pass",
        ],
        [TransactionCategory.SHOPPING]: [
            "Amazon",
            "H&M",
            "Zara",
            "Nike",
            "Apple Store",
        ],
        [TransactionCategory.ENTERTAINMENT]: [
            "Netflix",
            "Cinema",
            "Spotify",
            "Concert Ticket",
            "Game Store",
        ],
        [TransactionCategory.HEALTHCARE]: [
            "Pharmacy",
            "Doctor Visit",
            "Gym Membership",
            "Vitamins",
        ],
    };

    // Generate data for the last 6 months (0 to 5)
    for (let i = 0; i < 6; i++) {
        // 1. Monthly Salary (around 1st of month)
        transactions.push({
            id: `salary-${i}`,
            accountId: "account-2", // Salary Account
            title: "Monthly Salary",
            amount: 75000,
            type: TransactionType.CREDIT,
            category: TransactionCategory.SALARY,
            date: getDateForMonth(i, 1), // 1st of the month
        });

        // 2. Rent (around 5th of month)
        transactions.push({
            id: `rent-${i}`,
            accountId: "account-2",
            title: "Apartment Rent",
            amount: 25000,
            type: TransactionType.DEBIT,
            category: TransactionCategory.RENT,
            date: getDateForMonth(i, 5),
        });

        // 3. Utilities (around 10th-15th)
        transactions.push({
            id: `electricity-${i}`,
            accountId: "account-2",
            title: "Electricity Bill",
            amount: Math.floor(Math.random() * (3500 - 1500) + 1500), // Random 1500-3500
            type: TransactionType.DEBIT,
            category: TransactionCategory.UTILITIES,
            date: getDateForMonth(i, 10),
        });

        transactions.push({
            id: `internet-${i}`,
            accountId: "account-3", // Credit Card
            title: "Fiber Internet",
            amount: 1200,
            type: TransactionType.DEBIT,
            category: TransactionCategory.UTILITIES,
            date: getDateForMonth(i, 12),
        });

        // 4. Monthly Investment (around 20th)
        transactions.push({
            id: `invest-${i}`,
            accountId: "account-2", // Salary Account
            title: "SIP Investment",
            amount: 10000,
            type: TransactionType.DEBIT, // Debit from salary account
            category: TransactionCategory.OTHER_EXPENSE, // Using Other Expense as Investment is not an expense usually, but tracked as debit.
            date: getDateForMonth(i, 20),
        });

        // 5. Random Variable Expenses (Food, Transport, Shopping) - 12 per month
        for (let j = 0; j < 12; j++) {
            const categories = [
                TransactionCategory.FOOD,
                TransactionCategory.GROCERIES,
                TransactionCategory.TRANSPORT,
                TransactionCategory.SHOPPING,
                TransactionCategory.ENTERTAINMENT,
            ];
            const randomCategory =
                categories[Math.floor(Math.random() * categories.length)];
            const merchants = merchantNames[randomCategory] || ["Store"];
            const randomMerchant =
                merchants[Math.floor(Math.random() * merchants.length)];

            const randomDay = Math.floor(Math.random() * 28) + 1;
            const randomAmount = Math.floor(Math.random() * (3000 - 200) + 200);

            const useCreditCard = Math.random() > 0.5;

            transactions.push({
                id: `expense-${i}-${j}`,
                accountId: useCreditCard ? "account-3" : "account-4", // Mix of Credit Card and Cash
                title: randomMerchant,
                amount: randomAmount,
                type: TransactionType.DEBIT,
                category: randomCategory,
                date: getDateForMonth(i, randomDay),
            });
        }
    }

    // Sort by date descending
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
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
