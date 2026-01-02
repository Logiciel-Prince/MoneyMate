import { TransactionCategory, TransactionType } from '../types/Transaction';

/**
 * Parsed SMS transaction data (without id)
 */
export interface ParsedTransaction {
  /**
   * Transaction title/description
   */
  title: string;

  /**
   * Transaction amount
   */
  amount: number;

  /**
   * Transaction type (credit or debit)
   */
  type: TransactionType;

  /**
   * Transaction category
   */
  category: TransactionCategory;

  /**
   * Transaction date
   */
  date: Date;

  /**
   * Merchant/vendor name (if available)
   */
  merchant?: string;

  /**
   * Account number (last 4 digits, if available)
   */
  accountNumber?: string;

  /**
   * Available balance (if mentioned in SMS)
   */
  balance?: number;
}

/**
 * SMS parsing result
 */
export interface SMSParseResult {
  /**
   * Whether the SMS was successfully parsed
   */
  success: boolean;

  /**
   * Parsed transaction data (if successful)
   */
  transaction?: ParsedTransaction;

  /**
   * Error message (if parsing failed)
   */
  error?: string;
}

/**
 * Parse SMS text to extract transaction details
 * @param text - SMS text to parse
 * @returns Parsed transaction result
 * 
 * @example
 * parseSMSText("Rs.500 debited from A/c XX1234 on 02-01-26 at AMAZON")
 */
export function parseSMSText(text: string): SMSParseResult {
  try {
    // Normalize the text
    const normalizedText = text.toUpperCase().trim();

    // Check if it's a transaction SMS
    if (!isTransactionSMS(normalizedText)) {
      return {
        success: false,
        error: 'Not a transaction SMS',
      };
    }

    // Determine transaction type
    const type = getTransactionType(normalizedText);
    if (!type) {
      return {
        success: false,
        error: 'Could not determine transaction type',
      };
    }

    // Extract amount
    const amount = extractAmount(normalizedText);
    if (!amount) {
      return {
        success: false,
        error: 'Could not extract amount',
      };
    }

    // Extract merchant/description
    const merchant = extractMerchant(normalizedText);

    // Extract account number
    const accountNumber = extractAccountNumber(normalizedText);

    // Extract balance
    const balance = extractBalance(normalizedText);

    // Determine category based on merchant and type
    const category = determineCategory(merchant, type);

    // Create title
    const title = createTitle(type, merchant, amount);

    const transaction: ParsedTransaction = {
      title,
      amount,
      type,
      category,
      date: new Date(),
      merchant,
      accountNumber,
      balance,
    };

    return {
      success: true,
      transaction,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    };
  }
}

/**
 * Check if SMS text is a transaction SMS
 */
function isTransactionSMS(text: string): boolean {
  const transactionKeywords = [
    'DEBITED',
    'CREDITED',
    'WITHDRAWN',
    'DEPOSITED',
    'SPENT',
    'RECEIVED',
    'PAID',
    'TRANSFER',
    'UPI',
    'TRANSACTION',
  ];

  return transactionKeywords.some(keyword => text.includes(keyword));
}

/**
 * Determine transaction type from SMS text
 */
function getTransactionType(text: string): TransactionType | null {
  const debitKeywords = ['DEBITED', 'WITHDRAWN', 'SPENT', 'PAID', 'DEBIT'];
  const creditKeywords = ['CREDITED', 'DEPOSITED', 'RECEIVED', 'CREDIT'];

  if (debitKeywords.some(keyword => text.includes(keyword))) {
    return TransactionType.DEBIT;
  }

  if (creditKeywords.some(keyword => text.includes(keyword))) {
    return TransactionType.CREDIT;
  }

  return null;
}

/**
 * Extract amount from SMS text
 */
function extractAmount(text: string): number | null {
  // Common patterns:
  // Rs.500, Rs 500, INR 500, 500.00, ₹500
  const patterns = [
    /(?:RS\.?|INR|₹)\s*([0-9,]+\.?[0-9]*)/i,
    /(?:AMOUNT|AMT)[\s:]+(?:RS\.?|INR|₹)?\s*([0-9,]+\.?[0-9]*)/i,
    /([0-9,]+\.?[0-9]*)\s*(?:RS|INR|₹)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  return null;
}

/**
 * Extract merchant/vendor name from SMS text
 */
function extractMerchant(text: string): string | undefined {
  // Common patterns:
  // "at MERCHANT", "to MERCHANT", "from MERCHANT", "on MERCHANT"
  const patterns = [
    /(?:AT|TO|FROM|ON)\s+([A-Z][A-Z0-9\s&-]+?)(?:\s+ON|\s+AT|\s+UPI|\s+REF|\s+AVBL|\s+BAL|\.|$)/,
    /(?:VIA|USING)\s+([A-Z][A-Z0-9\s&-]+?)(?:\s+ON|\s+AT|\s+UPI|\s+REF|\s+AVBL|\s+BAL|\.|$)/,
    /UPI\/([A-Z0-9@\s]+?)(?:\s+ON|\s+AT|\s+REF|\s+AVBL|\s+BAL|\.|$)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Extract account number (last 4 digits) from SMS text
 */
function extractAccountNumber(text: string): string | undefined {
  // Common patterns:
  // "A/c XX1234", "A/C **1234", "Card XX1234"
  const patterns = [
    /(?:A\/C|ACCOUNT|CARD|AC)\s*(?:XX|NO\.?|\*\*)\s*(\d{4})/i,
    /(?:A\/C|ACCOUNT|CARD)\s*(?:ENDING|ENDING\s+WITH)\s*(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Extract available balance from SMS text
 */
function extractBalance(text: string): number | undefined {
  // Common patterns:
  // "Avbl Bal Rs.5000", "Balance: Rs 5000"
  const patterns = [
    /(?:AVBL|AVAILABLE|AVAIL)\s*(?:BAL|BALANCE)[\s:]*(?:RS\.?|INR|₹)?\s*([0-9,]+\.?[0-9]*)/i,
    /(?:BAL|BALANCE)[\s:]*(?:RS\.?|INR|₹)?\s*([0-9,]+\.?[0-9]*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const balanceStr = match[1].replace(/,/g, '');
      const balance = parseFloat(balanceStr);
      if (!isNaN(balance) && balance >= 0) {
        return balance;
      }
    }
  }

  return undefined;
}

/**
 * Determine transaction category based on merchant and type
 */
function determineCategory(
  merchant: string | undefined,
  type: TransactionType
): TransactionCategory {
  if (!merchant) {
    return type === TransactionType.CREDIT
      ? TransactionCategory.OTHER_INCOME
      : TransactionCategory.OTHER_EXPENSE;
  }

  const merchantUpper = merchant.toUpperCase();

  // Food & Dining
  if (
    /SWIGGY|ZOMATO|RESTAURANT|CAFE|FOOD|DOMINO|PIZZA|MCDONALD|KFC|BURGER/i.test(
      merchantUpper
    )
  ) {
    return TransactionCategory.FOOD;
  }

  // Shopping
  if (
    /AMAZON|FLIPKART|MYNTRA|AJIO|SHOPPING|MALL|STORE|RETAIL/i.test(merchantUpper)
  ) {
    return TransactionCategory.SHOPPING;
  }

  // Transport
  if (
    /UBER|OLA|RAPIDO|METRO|PETROL|FUEL|PARKING|FASTAG/i.test(merchantUpper)
  ) {
    return TransactionCategory.TRANSPORT;
  }

  // Entertainment
  if (
    /NETFLIX|PRIME|SPOTIFY|HOTSTAR|MOVIE|CINEMA|PVR|INOX|GAME/i.test(
      merchantUpper
    )
  ) {
    return TransactionCategory.ENTERTAINMENT;
  }

  // Bills & Utilities
  if (
    /ELECTRICITY|WATER|GAS|BILL|UTILITY|RECHARGE|MOBILE|INTERNET|BROADBAND/i.test(
      merchantUpper
    )
  ) {
    return TransactionCategory.BILLS;
  }

  // Groceries
  if (/GROCERY|SUPERMARKET|DMART|RELIANCE|FRESH|MART/i.test(merchantUpper)) {
    return TransactionCategory.GROCERIES;
  }

  // Healthcare
  if (/HOSPITAL|PHARMACY|MEDICAL|DOCTOR|CLINIC|HEALTH/i.test(merchantUpper)) {
    return TransactionCategory.HEALTHCARE;
  }

  // Salary (Credit)
  if (type === TransactionType.CREDIT && /SALARY|PAYROLL|WAGE/i.test(merchantUpper)) {
    return TransactionCategory.SALARY;
  }

  // Default categories
  return type === TransactionType.CREDIT
    ? TransactionCategory.OTHER_INCOME
    : TransactionCategory.OTHER_EXPENSE;
}

/**
 * Create transaction title
 */
function createTitle(
  type: TransactionType,
  merchant: string | undefined,
  amount: number
): string {
  const action = type === TransactionType.CREDIT ? 'Received from' : 'Paid to';
  const merchantName = merchant || 'Unknown';
  return `${action} ${merchantName}`;
}

/**
 * Test the SMS parser with sample SMS texts
 * @returns Array of test results
 */
export function testSMSParser(): Array<{ sms: string; result: SMSParseResult }> {
  const sampleSMS = [
    'Rs.500 debited from A/c XX1234 on 02-01-26 at AMAZON. Avbl Bal: Rs.5000',
    'INR 1200.00 credited to A/C **5678 on 02-Jan-26 from SALARY. Balance: Rs.25000',
    'You have spent Rs.350 at SWIGGY via UPI on 02-01-2026. Available balance: Rs.4650',
    'Rs 2500 withdrawn from Card XX9012 at ATM on 02/01/26',
    'UPI/GOOGLE PAY Rs.750 debited from A/c XX3456. Avbl Bal Rs.10250',
    'Rs.5000 received via UPI from JOHN DOE on 02-01-26',
  ];

  return sampleSMS.map(sms => ({
    sms,
    result: parseSMSText(sms),
  }));
}
