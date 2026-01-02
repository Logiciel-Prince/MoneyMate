/**
 * Typography constants for the MoneyMate app
 */

/**
 * Font families
 */
export const fontFamily = {
  /**
   * Regular font weight
   */
  regular: 'System',

  /**
   * Medium font weight
   */
  medium: 'System',

  /**
   * Semi-bold font weight
   */
  semiBold: 'System',

  /**
   * Bold font weight
   */
  bold: 'System',
};

/**
 * Font weights
 */
export const fontWeight = {
  /**
   * Regular weight (400)
   */
  regular: '400' as const,

  /**
   * Medium weight (500)
   */
  medium: '500' as const,

  /**
   * Semi-bold weight (600)
   */
  semiBold: '600' as const,

  /**
   * Bold weight (700)
   */
  bold: '700' as const,

  /**
   * Extra bold weight (800)
   */
  extraBold: '800' as const,
};

/**
 * Font sizes
 */
export const fontSize = {
  /**
   * Extra small (10px)
   */
  xs: 10,

  /**
   * Small (12px)
   */
  sm: 12,

  /**
   * Base/medium (14px)
   */
  md: 14,

  /**
   * Large (16px)
   */
  lg: 16,

  /**
   * Extra large (18px)
   */
  xl: 18,

  /**
   * 2x extra large (20px)
   */
  xxl: 20,

  /**
   * 3x extra large (24px)
   */
  xxxl: 24,

  /**
   * Huge (32px)
   */
  huge: 32,
};

/**
 * Line heights
 */
export const lineHeight = {
  /**
   * Tight line height (1.2)
   */
  tight: 1.2,

  /**
   * Normal line height (1.5)
   */
  normal: 1.5,

  /**
   * Relaxed line height (1.75)
   */
  relaxed: 1.75,

  /**
   * Loose line height (2)
   */
  loose: 2,
};

/**
 * Typography styles
 */
export const typography = {
  /**
   * Heading styles
   */
  heading: {
    h1: {
      fontSize: fontSize.huge,
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
    },
    h2: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
    },
    h3: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.normal,
    },
    h4: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.normal,
    },
    h5: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
    h6: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
  },

  /**
   * Body text styles
   */
  body: {
    large: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.relaxed,
    },
    medium: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.relaxed,
    },
    small: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
    },
  },

  /**
   * Caption/helper text styles
   */
  caption: {
    large: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
    },
    medium: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
    },
    small: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.tight,
    },
  },

  /**
   * Button text styles
   */
  button: {
    large: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.normal,
    },
    medium: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.normal,
    },
    small: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
  },

  /**
   * Label text styles
   */
  label: {
    large: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
    medium: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
    small: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
  },
};

/**
 * Typography type definition
 */
export type Typography = typeof typography;

/**
 * Default export
 */
export default typography;
