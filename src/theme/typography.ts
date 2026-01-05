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
     * Extra small (12px) - increased from 10px
     */
    xs: 14,

    /**
     * Small (14px) - increased from 12px
     */
    sm: 16,

    /**
     * Base/medium (16px) - increased from 14px
     */
    md: 18,

    /**
     * Large (18px) - increased from 16px
     */
    lg: 20,

    /**
     * Extra large (20px) - increased from 18px
     */
    xl: 24,

    /**
     * 2x extra large (24px) - increased from 20px
     */
    xxl: 28,

    /**
     * 3x extra large (28px) - increased from 24px
     */
    xxxl: 32,

    /**
     * Huge (36px) - increased from 32px
     */
    huge: 40,
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
        },
        h2: {
            fontSize: fontSize.xxxl,
            fontWeight: fontWeight.bold,
        },
        h3: {
            fontSize: fontSize.xxl,
            fontWeight: fontWeight.semiBold,
        },
        h4: {
            fontSize: fontSize.xl,
            fontWeight: fontWeight.semiBold,
        },
        h5: {
            fontSize: fontSize.lg,
            fontWeight: fontWeight.medium,
        },
        h6: {
            fontSize: fontSize.md,
            fontWeight: fontWeight.medium,
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
        },
        medium: {
            fontSize: fontSize.xs,
            fontWeight: fontWeight.regular,
        },
        small: {
            fontSize: fontSize.xs,
            fontWeight: fontWeight.regular,
        },
    },

    /**
     * Button text styles
     */
    button: {
        large: {
            fontSize: fontSize.lg,
            fontWeight: fontWeight.semiBold,
        },
        medium: {
            fontSize: fontSize.md,
            fontWeight: fontWeight.semiBold,
        },
        small: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium,
        },
    },

    /**
     * Label text styles
     */
    label: {
        large: {
            fontSize: fontSize.md,
            fontWeight: fontWeight.medium,
        },
        medium: {
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium,
        },
        small: {
            fontSize: fontSize.xs,
            fontWeight: fontWeight.medium,
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
