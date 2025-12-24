/**
 * Domain model for CEFR Level
 * Uses camelCase field names for UI consumption
 */
export type CefrLevel = {
  level: string;
  status: "draft" | "published" | "archived" | null;
  visibility: "private" | "beta" | "public" | null;
  description: string | null;
  authorNotes: string | null;
};

