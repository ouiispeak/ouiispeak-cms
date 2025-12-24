/**
 * Domain model for Module
 * Uses camelCase field names for UI consumption
 */
export type Module = {
  id: string;
  slug: string;
  label: string | null;
  title: string | null;
  level: string | null;
  orderIndex: number | null;
  status: string | null;
  visibility: string | null;
  description: string | null;
  moduleGoal: string | null;
  coreTopics: string | null;
  authorNotes: string | null;
};

