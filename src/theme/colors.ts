/**
 * Color palette for the MoneyMate app
 */

/**
 * Light theme colors
 */
export const lightColors = {
    // Primary brand color
    primary: "#2563EB", // Blue
    primaryLight: "#60A5FA",
    primaryDark: "#1D4ED8",

    // Success color (for income/positive actions)
    success: "#10B981", // Green
    successLight: "#34D399",
    successDark: "#059669",

    // Danger color (for expenses/negative actions)
    danger: "#EF4444", // Red
    dangerLight: "#F87171",
    dangerDark: "#DC2626",

    // Warning color
    warning: "#F59E0B", // Amber
    warningLight: "#FBBF24",
    warningDark: "#D97706",

    // Info color
    info: "#3B82F6", // Blue
    infoLight: "#60A5FA",
    infoDark: "#2563EB",

    // Background colors
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundTertiary: "#F3F4F6",

    // Surface colors (for cards, modals)
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",

    // Text colors
    text: "#111827", // Dark gray
    textSecondary: "#6B7280", // Medium gray
    textTertiary: "#9CA3AF", // Light gray
    textInverse: "#FFFFFF",

    // Muted/disabled colors
    muted: "#D1D5DB",
    mutedLight: "#E5E7EB",
    mutedDark: "#9CA3AF",

    // Border colors
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
    borderDark: "#D1D5DB",

    // Overlay colors
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayLight: "rgba(0, 0, 0, 0.3)",

    // Special colors
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
};

/**
 * Dark theme colors
 */
export const darkColors = {
    // Primary brand color
    primary: "#2563EB", // Blue (same for consistency or slightly adjusted if needed, but keeping explicit request)
    primaryLight: "#60A5FA",
    primaryDark: "#1D4ED8",

    // Success color
    success: "#34D399", // Lighter green
    successLight: "#6EE7B7",
    successDark: "#10B981",

    // Danger color
    danger: "#F87171", // Lighter red
    dangerLight: "#FCA5A5",
    dangerDark: "#EF4444",

    // Warning color
    warning: "#FBBF24", // Lighter amber
    warningLight: "#FCD34D",
    warningDark: "#F59E0B",

    // Info color
    info: "#60A5FA", // Lighter blue
    infoLight: "#93C5FD",
    infoDark: "#3B82F6",

    // Background colors
    background: "#111827", // Dark gray
    backgroundSecondary: "#1F2937",
    backgroundTertiary: "#374151",

    // Surface colors
    surface: "#1F2937",
    surfaceElevated: "#374151",

    // Text colors
    text: "#F9FAFB", // Light gray
    textSecondary: "#D1D5DB",
    textTertiary: "#9CA3AF",
    textInverse: "#111827",

    // Muted/disabled colors
    muted: "#4B5563",
    mutedLight: "#6B7280",
    mutedDark: "#374151",

    // Border colors
    border: "#374151",
    borderLight: "#4B5563",
    borderDark: "#1F2937",

    // Overlay colors
    overlay: "rgba(0, 0, 0, 0.7)",
    overlayLight: "rgba(0, 0, 0, 0.5)",

    // Special colors
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
};

/**
 * Color type definition
 */
export type Colors = typeof lightColors;

/**
 * Default export (light theme)
 */
export default lightColors;
