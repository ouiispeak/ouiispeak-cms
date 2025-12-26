import type { SlideProps } from "../types/slideProps";

/**
 * Domain model for Slide
 * Uses camelCase field names for UI consumption
 */
export type Slide = {
  id: string;
  lessonId: string | null;
  groupId: string | null;
  orderIndex: number | null;
  type: string;
  /** Slide-specific properties. Use getTypedSlideProps() or type guards for type-safe access. */
  propsJson: SlideProps | unknown; // Prefer SlideProps, but allow unknown for backward compatibility
  aidHook: string | null;
  code: string | null;
  metaJson: unknown | null;
  isActivity: boolean | null;
  scoreType: string | null;
  passingScoreValue: number | null;
  maxScoreValue: number | null;
  passRequiredForNext: boolean | null;
};

/**
 * Minimal slide data for dropdowns/lists
 */
export type SlideMinimal = {
  id: string;
  lessonId: string | null;
  groupId: string | null;
  orderIndex: number | null;
  type: string;
};

