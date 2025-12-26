/**
 * Database row type definitions
 * Centralized types matching Supabase table row structures
 * All field names use snake_case to match database schema
 */

/**
 * Row type for the `modules` table
 */
export type ModuleRow = {
  id: string;
  title: string;
  slug: string;
  level?: string;
  order_index: number | null;
};

/**
 * Row type for the `lessons` table
 * Note: `module_id` is required for production tables, `lesson_slug` is used by authoring tables
 */
export type LessonRow = {
  id: string;
  module_id?: string; // Required for production `lessons` table, optional for authoring
  title: string;
  slug?: string;
  lesson_slug?: string; // Used by authoring tables (`lessons_authoring`)
  order_index?: number | null;
};

/**
 * Row type for the `lesson_groups` table
 */
export type GroupRow = {
  id: string;
  lesson_id?: string;
  title: string;
  order_index: number | null;
};

/**
 * Row type for the `slides` table
 */
export type SlideRow = {
  id: string;
  lesson_id?: string;
  group_id: string | null;
  type: string;
  props_json: unknown;
  order_index: number | null;
  aid_hook?: string | null;
  code?: string | null;
  meta_json?: unknown;
  is_activity?: boolean | null;
  score_type?: string | null;
  passing_score_value?: number | null;
  max_score_value?: number | null;
  pass_required_for_next?: boolean | null;
};

