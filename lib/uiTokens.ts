/**
 * UI Design Tokens
 * Centralized color palette and design constants for the CMS
 */

export const uiTokens = {
  border: "#ddd",
  bg: "#edeae7",
  primary: "#9bbfb2",
  primaryHover: "#8aaea1",
  danger: "#bf6f6f",
  dangerHover: "#ad5f5f",
  secondary: "#a6a198",
  secondaryHover: "#959088",
} as const;

// Export individual tokens for convenience
export const {
  border,
  bg,
  primary,
  primaryHover,
  danger,
  dangerHover,
  secondary,
  secondaryHover,
} = uiTokens;

