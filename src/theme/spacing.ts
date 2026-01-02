/**
 * Spacing constants for the MoneyMate app
 * Based on 4px base unit for consistency
 */

/**
 * Spacing scale
 */
export const spacing = {
  /**
   * Extra small spacing (4px)
   */
  xs: 4,

  /**
   * Small spacing (8px)
   */
  sm: 8,

  /**
   * Medium spacing (16px)
   */
  md: 16,

  /**
   * Large spacing (24px)
   */
  lg: 24,

  /**
   * Extra large spacing (32px)
   */
  xl: 32,

  /**
   * Extra extra large spacing (48px)
   */
  xxl: 48,

  /**
   * Extra extra extra large spacing (64px)
   */
  xxxl: 64,
};

/**
 * Border radius values
 */
export const borderRadius = {
  /**
   * No border radius
   */
  none: 0,

  /**
   * Small border radius (4px)
   */
  sm: 4,

  /**
   * Medium border radius (8px)
   */
  md: 8,

  /**
   * Large border radius (12px)
   */
  lg: 12,

  /**
   * Extra large border radius (16px)
   */
  xl: 16,

  /**
   * Extra extra large border radius (24px)
   */
  xxl: 24,

  /**
   * Full/circular border radius (9999px)
   */
  full: 9999,
};

/**
 * Icon sizes
 */
export const iconSize = {
  /**
   * Extra small icon (12px)
   */
  xs: 12,

  /**
   * Small icon (16px)
   */
  sm: 16,

  /**
   * Medium icon (24px)
   */
  md: 24,

  /**
   * Large icon (32px)
   */
  lg: 32,

  /**
   * Extra large icon (48px)
   */
  xl: 48,

  /**
   * Extra extra large icon (64px)
   */
  xxl: 64,
};

/**
 * Container padding
 */
export const containerPadding = {
  /**
   * Horizontal padding for screens
   */
  horizontal: spacing.md,

  /**
   * Vertical padding for screens
   */
  vertical: spacing.lg,
};

/**
 * Spacing type definition
 */
export type Spacing = typeof spacing;

/**
 * Default export
 */
export default spacing;
