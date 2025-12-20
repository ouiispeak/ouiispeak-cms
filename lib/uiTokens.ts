/**
 * UI Design Tokens
 * Centralized color palette and design constants for the CMS
 * Single source of truth for all visual styling
 */

export const uiTokens = {
  color: {
    // Locked MVP palette - base layer tokens
    bg: "#f6f5f3", // page background
    surface: "#edeae7", // panels/cards/surfaces
    text: "#192026", // default text
    textMuted: "#595852", // muted text
    border: "#d9d3cc", // borders/dividers
    
    // Locked MVP palette - semantic tokens
    primary: "#0c9599",
    success: "#548c87",
    danger: "#bf1736",
    focus: "#247368",

    // Utility tokens for accessibility (text on dark backgrounds)
    textOnDark: "#f6f5f3", // background color for text on primary/danger buttons

    // Legacy/compatibility (deprecated, use tokens above)
    bgAlt: "#f6f5f3", // same as bg
    mutedText: "#595852", // same as textMuted
    navBg: "#edeae7", // light surface tone: matches surface token for visual comfort and receding hierarchy
    navText: "#192026", // standard text color for comfortable contrast on light background
    borderSubtle: "#d9d3cc", // same as border
    inputBorder: "#d9d3cc", // same as border
    primaryHover: "#0c9599", // TODO: define hover states in next microstep
    primaryText: "#f6f5f3", // background color for contrast on primary background
    secondary: "#a6a198", // TODO: define in next microstep
    secondaryHover: "#b8bcb7", // TODO: define in next microstep
    secondaryText: "#192026", // same as text
    dangerHover: "#bf1736", // same as danger
    dangerText: "#f6f5f3", // background color for contrast on danger background
    link: "#247368", // same as focus
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
