/**
 * UI Design Tokens
 * Centralized color palette and design constants for the CMS
 * Single source of truth for all visual styling
 */

export const uiTokens = {
  color: {
    bg: "#edeae7",
    bgAlt: "#f6f5f3",
    text: "#222326",
    mutedText: "#595852",

    navBg: "#2b3640",
    navText: "#f6f5f3",

    border: "#d9d3c7",
    borderSubtle: "#d9d3cc",
    inputBorder: "#d9d3c7",

    primary: "#9bbfb2",
    primaryHover: "#85a6a0",
    primaryText: "#222326",

    secondary: "#a6a198",
    secondaryHover: "#b8bcb7",
    secondaryText: "#222326",

    danger: "#bf6f6f",
    dangerHover: "#bf1736",
    dangerText: "#222326",

    link: "#247368",
  },
  radius: { sm: 4, md: 6, lg: 8 },
  space: { xs: 8, sm: 12, md: 16, lg: 24 },
  font: {
    pageTitle: { size: 24, weight: 400 },
    sectionTitle: { size: 18, weight: 400 },
    label: { size: 14, weight: 600 },
    meta: { size: 13, weight: 400 },
    code: { size: 12, weight: 400 },
  },
} as const;

// Legacy exports for backward compatibility (deprecated, use uiTokens.color.*)
export const border = uiTokens.color.border;
export const bg = uiTokens.color.bg;
export const primary = uiTokens.color.primary;
export const primaryHover = uiTokens.color.primaryHover;
export const danger = uiTokens.color.danger;
export const dangerHover = uiTokens.color.dangerHover;
export const secondary = uiTokens.color.secondary;
export const secondaryHover = uiTokens.color.secondaryHover;
