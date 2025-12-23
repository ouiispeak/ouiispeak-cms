import { uiTokens } from "../uiTokens";
import type { CSSProperties } from "react";

/**
 * Shared style objects for slide type edit pages
 * Extracted from /cms/slide-types/[type]/edit/page.tsx
 * 
 * These styles are automatically applied to all slide type edit pages
 * via the dynamic route [type]/edit/page.tsx
 */

// Section-specific colors
const SECTION_BG_COLOR = "#f8f0ed"; // Light pinkish hue
const SECTION_BORDER_COLOR = "#f2e1db";
const DANGER_COLOR = "#bf1736";

// Breadcrumb styles
export const breadcrumbContainer: CSSProperties = {
  fontSize: 13,
  color: uiTokens.color.textMuted,
  marginBottom: uiTokens.space.sm,
  display: "flex",
  alignItems: "center",
  gap: uiTokens.space.xs,
};

export const breadcrumbLink: CSSProperties = {
  color: uiTokens.color.textMuted,
  textDecoration: "none",
  fontWeight: 400,
};

export const breadcrumbSeparator: CSSProperties = {
  color: uiTokens.color.textMuted,
};

export const breadcrumbCurrent: CSSProperties = {
  fontWeight: 600,
};

// Field Visibility Section
export const fieldVisibilitySection = {
  backgroundColor: SECTION_BG_COLOR,
  borderColor: SECTION_BORDER_COLOR,
  headerSpacing: uiTokens.space.lg * 1.5, // 36px
};

// Two-column grid layout
export const twoColumnGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: "5%",
  rowGap: uiTokens.space.lg,
};

// Column container
export const columnContainer: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

// Column title (h3)
export const columnTitle: CSSProperties = {
  marginBottom: uiTokens.space.sm,
  fontSize: uiTokens.font.sectionTitle.size,
  fontWeight: uiTokens.font.sectionTitle.weight,
};

// Categories grid container (for default type)
export const categoriesGrid: CSSProperties = {
  display: "grid",
  gap: uiTokens.space.lg, // Spacing between categories
};

// Category container
export const categoryContainer: CSSProperties = {
  display: "grid",
  gap: uiTokens.space.xs, // Internal spacing within category
};

// Category title
export const categoryTitle: CSSProperties = {
  fontSize: uiTokens.font.sectionTitle.size - 2, // 16px
  fontWeight: uiTokens.font.sectionTitle.weight,
  color: uiTokens.color.textMuted,
};

// Field list (ul)
export const fieldList: CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: uiTokens.space.sm, // Spacing between field items
};

// Visible field item (li)
export const visibleFieldItem: CSSProperties = {
  padding: uiTokens.space.sm,
  border: `1px solid ${uiTokens.color.border}`,
  borderRadius: uiTokens.radius.md,
  backgroundColor: uiTokens.color.bgAlt,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

// Hidden field item (li)
export const hiddenFieldItem: CSSProperties = {
  padding: uiTokens.space.sm,
  border: `1px dashed ${uiTokens.color.border}`,
  borderRadius: uiTokens.radius.md,
  backgroundColor: uiTokens.color.surface,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  opacity: 0.8,
};

// Field label
export const fieldLabel: CSSProperties = {
  fontWeight: 400,
};

// Field help text (metaText class)
export const fieldHelpText: CSSProperties = {
  color: uiTokens.color.textMuted,
};

// Hide button (for visible fields)
export const hideButton: CSSProperties = {
  border: `1px solid ${DANGER_COLOR}`,
  background: DANGER_COLOR,
  color: uiTokens.color.textOnDark,
  borderRadius: uiTokens.radius.sm,
  padding: "4px 8px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

// Show button (for hidden fields)
export const showButton: CSSProperties = {
  border: `1px solid ${uiTokens.color.primary}`,
  background: uiTokens.color.primary,
  color: uiTokens.color.textOnDark,
  borderRadius: uiTokens.radius.sm,
  padding: "4px 8px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

// Button icon SVG
export const buttonIcon: CSSProperties = {
  width: 16,
  height: 16,
  stroke: uiTokens.color.bg,
};

// Empty state message
export const emptyState: CSSProperties = {
  color: uiTokens.color.textMuted,
};

// Preset JSON Section
export const presetJsonSection = {
  backgroundColor: SECTION_BG_COLOR,
  borderColor: SECTION_BORDER_COLOR,
};

// Preset JSON textarea
export const presetTextarea: CSSProperties = {
  width: "100%",
  minHeight: 180,
  padding: uiTokens.space.sm,
  borderRadius: uiTokens.radius.md,
  border: `1px solid ${uiTokens.color.border}`,
  fontFamily: "monospace",
  fontSize: 13,
  backgroundColor: uiTokens.color.surface,
};

// Live Preview Section
export const livePreviewSection = {
  backgroundColor: "transparent",
  borderColor: SECTION_BORDER_COLOR,
};

