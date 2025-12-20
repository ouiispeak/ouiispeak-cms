import { supabase } from "../supabase";
import type { Slide, SlideMinimal } from "../domain/slide";
import { toSlide, toSlideMinimal } from "../mappers/slideMapper";

/**
 * Standard fields to select from slides table
 * Centralized to avoid repetition across pages
 */
const SLIDE_FIELDS_FULL = "id, lesson_id, group_id, order_index, type, props_json, aid_hook, code, meta_json, is_activity, score_type, passing_score_value, max_score_value, pass_required_for_next";

/**
 * Minimal fields for dropdowns/lists
 */
const SLIDE_FIELDS_MINIMAL = "id, lesson_id, group_id, order_index, type";

/**
 * Type for slide data returned from the database
 */
export type SlideData = {
  id: string;
  lesson_id: string | null;
  group_id: string | null;
  order_index: number | null;
  type: string;
  props_json: unknown;
  aid_hook: string | null;
  code: string | null;
  meta_json: unknown | null;
  is_activity: boolean | null;
  score_type: string | null;
  passing_score_value: number | null;
  max_score_value: number | null;
  pass_required_for_next: boolean | null;
};

/**
 * Minimal slide data for dropdowns/lists
 */
export type SlideDataMinimal = {
  id: string;
  lesson_id: string | null;
  group_id: string | null;
  order_index: number | null;
  type: string;
};

/**
 * Type for creating a new slide
 * All NOT NULL fields are required: lesson_id, group_id, order_index, type
 */
export type CreateSlideInput = {
  lesson_id: string; // NOT NULL - required
  group_id: string; // NOT NULL - required (every slide belongs to a group)
  order_index: number; // NOT NULL - required
  type: string; // NOT NULL - required
  props_json?: unknown; // NOT NULL - defaults to {} if not provided
  aid_hook?: string | null;
  code?: string | null;
  meta_json?: unknown | null; // NOT NULL - defaults to {} if not provided
  is_activity?: boolean | null; // NOT NULL - defaults computed from type if not provided
  score_type?: string | null; // NOT NULL - defaults to 'none' if not provided
  passing_score_value?: number | null;
  max_score_value?: number | null;
  pass_required_for_next?: boolean | null; // NOT NULL - defaults to false if not provided
};

/**
 * Type for updating a slide
 */
export type UpdateSlideInput = Partial<CreateSlideInput>;

/**
 * Result type for data operations
 */
export type SlideResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Load slides by lesson ID
 * Returns domain models (camelCase)
 */
export async function loadSlidesByLesson(lessonId: string): Promise<SlideResult<SlideMinimal[]>> {
  const { data, error } = await supabase
    .from("slides")
    .select(SLIDE_FIELDS_MINIMAL)
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  const rows = (data ?? []) as SlideDataMinimal[];
  return { data: rows.map(toSlideMinimal), error: null };
}

/**
 * Load slides by group ID
 * Returns domain models (camelCase)
 */
export async function loadSlidesByGroup(groupId: string): Promise<SlideResult<SlideMinimal[]>> {
  const { data, error } = await supabase
    .from("slides")
    .select(SLIDE_FIELDS_MINIMAL)
    .eq("group_id", groupId)
    .order("order_index", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  const rows = (data ?? []) as SlideDataMinimal[];
  return { data: rows.map(toSlideMinimal), error: null };
}

/**
 * Load a single slide by ID
 * Returns domain model (camelCase)
 */
export async function loadSlideById(id: string): Promise<SlideResult<Slide>> {
  const { data, error } = await supabase
    .from("slides")
    .select(SLIDE_FIELDS_FULL)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: `No slide found with id "${id}"` };
  }

  return { data: toSlide(data as SlideData), error: null };
}

/**
 * Helper function to compute default is_activity based on slide type
 * Most slide types are activities by default, except title/text slides
 * Exported for testing
 */
export function defaultIsActivity(slideType: string, providedValue: boolean | null | undefined): boolean {
  if (providedValue !== null && providedValue !== undefined) {
    return providedValue;
  }
  // Default: most slides are activities, except title and text slides
  const nonActivityTypes = ["title-slide", "title", "text-slide", "text"];
  return !nonActivityTypes.includes(slideType.toLowerCase().trim());
}

/**
 * Create a new slide
 * Returns domain model (camelCase)
 * 
 * Ensures all NOT NULL fields have safe defaults:
 * - lesson_id: required (must be provided)
 * - group_id: required (must be provided)
 * - order_index: required (must be provided)
 * - type: required (must be provided)
 * - props_json: defaults to {} if not provided
 * - meta_json: defaults to {} if not provided
 * - is_activity: computed from slide type if not provided
 * - score_type: defaults to 'none' if not provided
 * - pass_required_for_next: defaults to false if not provided
 */
export async function createSlide(input: CreateSlideInput): Promise<SlideResult<SlideMinimal>> {
  // Validate required NOT NULL fields
  if (!input.lesson_id) {
    return { data: null, error: "lesson_id is required (NOT NULL)" };
  }
  if (!input.group_id) {
    return { data: null, error: "group_id is required (NOT NULL). Every slide must belong to a group." };
  }
  if (input.order_index === undefined || input.order_index === null) {
    return { data: null, error: "order_index is required (NOT NULL)" };
  }
  if (!input.type) {
    return { data: null, error: "type is required (NOT NULL)" };
  }

  // Compute defaults for NOT NULL fields
  const isActivityValue = defaultIsActivity(input.type, input.is_activity);
  
  // Build insert payload explicitly, ensuring NOT NULL fields are never null
  const insertPayload = {
    lesson_id: input.lesson_id,
    group_id: input.group_id, // Required - never null
    order_index: input.order_index, // Required - never null
    type: input.type, // Required - never null
    props_json: input.props_json ?? {}, // NOT NULL - default to {}
    aid_hook: input.aid_hook ?? null,
    code: input.code ?? null,
    meta_json: input.meta_json ?? {}, // NOT NULL - default to {}
    is_activity: isActivityValue, // NOT NULL - always a boolean, never null
    score_type: input.score_type ?? 'none', // NOT NULL - default to 'none'
    passing_score_value: input.passing_score_value ?? null,
    max_score_value: input.max_score_value ?? null,
    pass_required_for_next: input.pass_required_for_next ?? false, // NOT NULL - default to false
  };

  const { data, error } = await supabase
    .from("slides")
    .insert(insertPayload)
    .select(SLIDE_FIELDS_MINIMAL)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Insert succeeded but no data returned" };
  }

  return { data: toSlideMinimal(data as SlideDataMinimal), error: null };
}

/**
 * Update an existing slide
 * Returns domain model (camelCase)
 */
export async function updateSlide(
  id: string,
  input: UpdateSlideInput
): Promise<SlideResult<Slide>> {
  const updateData: Record<string, unknown> = {};

  if (input.lesson_id !== undefined) updateData.lesson_id = input.lesson_id;
  if (input.group_id !== undefined) updateData.group_id = input.group_id;
  if (input.order_index !== undefined) updateData.order_index = input.order_index;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.props_json !== undefined) updateData.props_json = input.props_json;
  if (input.aid_hook !== undefined) updateData.aid_hook = input.aid_hook;
  if (input.code !== undefined) updateData.code = input.code;
  if (input.meta_json !== undefined) updateData.meta_json = input.meta_json;
  if (input.is_activity !== undefined) updateData.is_activity = input.is_activity;
  if (input.score_type !== undefined) updateData.score_type = input.score_type;
  if (input.passing_score_value !== undefined) updateData.passing_score_value = input.passing_score_value;
  if (input.max_score_value !== undefined) updateData.max_score_value = input.max_score_value;
  if (input.pass_required_for_next !== undefined) updateData.pass_required_for_next = input.pass_required_for_next;

  const { data, error } = await supabase
    .from("slides")
    .update(updateData)
    .eq("id", id)
    .select(SLIDE_FIELDS_FULL)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: `No slide found with id "${id}"` };
  }

  return { data: toSlide(data as SlideData), error: null };
}

/**
 * Delete a slide by ID
 */
export async function deleteSlide(id: string): Promise<SlideResult<void>> {
  const { error } = await supabase
    .from("slides")
    .delete()
    .eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

