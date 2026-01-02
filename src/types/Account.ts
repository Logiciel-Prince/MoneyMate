/**
 * Account type enumeration
 */
export enum AccountType {
  SAVINGS = 'savings',
  CHECKING = 'checking',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
  INVESTMENT = 'investment',
  OTHER = 'other',
}

/**
 * Account interface
 */
export interface Account {
  /**
   * Unique identifier for the account
   */
  id: string;

  /**
   * Display name of the account
   */
  name: string;

  /**
   * Type of the account
   */
  type: AccountType;

  /**
   * Current balance of the account
   */
  balance: number;
}
