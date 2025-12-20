/**
 * Domain model for Lesson
 * Uses camelCase field names for UI consumption
 */
export type Lesson = {
  id: string;
  moduleId: string | null;
  title: string;
  slug: string | null;
  orderIndex: number | null;
  estimatedMinutes: number | null;
  requiredScore: number | null;
  content: string | null;
  shortSummaryAdmin: string | null;
  shortSummaryStudent: string | null;
  courseOrganizationGroup: string | null;
  slideContents: string | null;
  groupingStrategySummary: string | null;
  activityTypes: string | null;
  activityDescription: string | null;
  signatureMetaphors: string | null;
  mainGrammarTopics: string | null;
  pronunciationFocus: string | null;
  vocabularyTheme: string | null;
  l1L2Issues: string | null;
  prerequisites: string | null;
  learningObjectives: string | null;
  notesForTeacherOrAI: string | null;
};

/**
 * Minimal lesson data for dropdowns/lists
 */
export type LessonMinimal = {
  id: string;
  slug: string | null;
  title: string;
};

