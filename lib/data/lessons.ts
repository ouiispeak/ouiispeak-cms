import { supabase } from "../supabase";
import { lessonInputSchema } from "../schemas/lessonSchema";
import type { Lesson, LessonMinimal } from "../domain/lesson";
import { toLesson, toLessonMinimal } from "../mappers/lessonMapper";

/**
 * Standard fields to select from lessons table
 * Centralized to avoid repetition across pages
 */
const LESSON_FIELDS_FULL = "id, module_id, title, slug, order_index, estimated_minutes, required_score, content, short_summary_admin, short_summary_student, course_organization_group, slide_contents, grouping_strategy_summary, activity_types, activity_description, signature_metaphors, main_grammar_topics, pronunciation_focus, vocabulary_theme, l1_l2_issues, prerequisites, learning_objectives, notes_for_teacher_or_ai";

/**
 * Minimal fields for dropdowns/lists
 */
const LESSON_FIELDS_MINIMAL = "id, slug, title";

/**
 * Type for lesson data returned from the database
 */
export type LessonData = {
  id: string;
  module_id: string | null;
  title: string;
  slug: string | null;
  order_index: number | null;
  estimated_minutes: number | null;
  required_score: number | null;
  content: string | null;
  short_summary_admin: string | null;
  short_summary_student: string | null;
  course_organization_group: string | null;
  slide_contents: string | null;
  grouping_strategy_summary: string | null;
  activity_types: string | null;
  activity_description: string | null;
  signature_metaphors: string | null;
  main_grammar_topics: string | null;
  pronunciation_focus: string | null;
  vocabulary_theme: string | null;
  l1_l2_issues: string | null;
  prerequisites: string | null;
  learning_objectives: string | null;
  notes_for_teacher_or_ai: string | null;
};

/**
 * Minimal lesson data for dropdowns/lists
 */
export type LessonDataMinimal = {
  id: string;
  slug: string | null;
  title: string;
};

/**
 * Type for creating a new lesson
 */
export type CreateLessonInput = {
  module_id: string;
  slug: string;
  title: string;
  order_index?: number | null;
  estimated_minutes?: number | null;
  required_score?: number | null;
  content?: string | null;
  short_summary_admin?: string | null;
  short_summary_student?: string | null;
  course_organization_group?: string | null;
  slide_contents?: string | null;
  grouping_strategy_summary?: string | null;
  activity_types?: string | null;
  activity_description?: string | null;
  signature_metaphors?: string | null;
  main_grammar_topics?: string | null;
  pronunciation_focus?: string | null;
  vocabulary_theme?: string | null;
  l1_l2_issues?: string | null;
  prerequisites?: string | null;
  learning_objectives?: string | null;
  notes_for_teacher_or_ai?: string | null;
};

/**
 * Type for updating a lesson
 */
export type UpdateLessonInput = Partial<CreateLessonInput>;

/**
 * Result type for data operations
 */
export type LessonResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Load all lessons (minimal fields, for dropdowns)
 * Ordered by created_at DESC, limited to 50
 * Returns domain models (camelCase)
 */
export async function loadLessons(): Promise<LessonResult<LessonMinimal[]>> {
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_FIELDS_MINIMAL)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { data: null, error: error.message };
  }

  const rows = (data ?? []) as LessonDataMinimal[];
  return { data: rows.map(toLessonMinimal), error: null };
}

/**
 * Load lessons by module ID
 */
export async function loadLessonsByModule(moduleId: string): Promise<LessonResult<LessonData[]>> {
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_FIELDS_FULL)
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []) as LessonData[], error: null };
}

/**
 * Load a single lesson by ID
 * Returns domain model (camelCase)
 */
export async function loadLessonById(id: string): Promise<LessonResult<Lesson>> {
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_FIELDS_FULL)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: `No lesson found with id "${id}"` };
  }

  return { data: toLesson(data as LessonData), error: null };
}

/**
 * Create a new lesson
 */
export async function createLesson(input: CreateLessonInput): Promise<LessonResult<LessonDataMinimal>> {
  // Normalize activity_types: convert array to string if needed
  let activityTypesValue: string | null = null;
  if (input.activity_types) {
    if (Array.isArray(input.activity_types)) {
      activityTypesValue = input.activity_types.length > 0 ? input.activity_types.join(",") : null;
    } else {
      activityTypesValue = input.activity_types.trim() || null;
    }
  }

  // Validate input using schema
  const validationResult = lessonInputSchema.safeParse({
    module_id: input.module_id,
    slug: input.slug,
    title: input.title.trim(),
    order_index: input.order_index ?? null,
    estimated_minutes: input.estimated_minutes ?? null,
    required_score: input.required_score ?? null,
    content: input.content?.trim() || null,
    short_summary_admin: input.short_summary_admin?.trim() || null,
    short_summary_student: input.short_summary_student?.trim() || null,
    course_organization_group: input.course_organization_group?.trim() || null,
    slide_contents: input.slide_contents?.trim() || null,
    grouping_strategy_summary: input.grouping_strategy_summary?.trim() || null,
    activity_types: activityTypesValue,
    activity_description: input.activity_description?.trim() || null,
    signature_metaphors: input.signature_metaphors?.trim() || null,
    main_grammar_topics: input.main_grammar_topics?.trim() || null,
    pronunciation_focus: input.pronunciation_focus?.trim() || null,
    vocabulary_theme: input.vocabulary_theme?.trim() || null,
    l1_l2_issues: input.l1_l2_issues?.trim() || null,
    prerequisites: input.prerequisites?.trim() || null,
    learning_objectives: input.learning_objectives?.trim() || null,
    notes_for_teacher_or_ai: input.notes_for_teacher_or_ai?.trim() || null,
  });

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return { data: null, error: `Validation error: ${firstError.message}` };
  }

  const { data, error } = await supabase
    .from("lessons")
    .insert(validationResult.data)
    .select("id, module_id, slug, title, order_index")
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Insert succeeded but no data returned" };
  }

  return { data: { id: data.id, slug: data.slug, title: data.title } as LessonDataMinimal, error: null };
}

/**
 * Update an existing lesson
 * Returns domain model (camelCase)
 */
export async function updateLesson(
  id: string,
  input: UpdateLessonInput
): Promise<LessonResult<Lesson>> {
  const updateData: Record<string, unknown> = {};

  if (input.module_id !== undefined) updateData.module_id = input.module_id;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.order_index !== undefined) updateData.order_index = input.order_index;
  if (input.estimated_minutes !== undefined) updateData.estimated_minutes = input.estimated_minutes;
  if (input.required_score !== undefined) updateData.required_score = input.required_score;
  if (input.content !== undefined) updateData.content = input.content?.trim() || null;
  if (input.short_summary_admin !== undefined) updateData.short_summary_admin = input.short_summary_admin?.trim() || null;
  if (input.short_summary_student !== undefined) updateData.short_summary_student = input.short_summary_student?.trim() || null;
  if (input.course_organization_group !== undefined) updateData.course_organization_group = input.course_organization_group?.trim() || null;
  if (input.slide_contents !== undefined) updateData.slide_contents = input.slide_contents?.trim() || null;
  if (input.grouping_strategy_summary !== undefined) updateData.grouping_strategy_summary = input.grouping_strategy_summary?.trim() || null;
  
  // Normalize activity_types: convert array to string if needed
  if (input.activity_types !== undefined) {
    if (Array.isArray(input.activity_types)) {
      updateData.activity_types = input.activity_types.length > 0 ? input.activity_types.join(",") : null;
    } else {
      updateData.activity_types = input.activity_types?.trim() || null;
    }
  }
  
  if (input.activity_description !== undefined) updateData.activity_description = input.activity_description?.trim() || null;
  if (input.signature_metaphors !== undefined) updateData.signature_metaphors = input.signature_metaphors?.trim() || null;
  if (input.main_grammar_topics !== undefined) updateData.main_grammar_topics = input.main_grammar_topics?.trim() || null;
  if (input.pronunciation_focus !== undefined) updateData.pronunciation_focus = input.pronunciation_focus?.trim() || null;
  if (input.vocabulary_theme !== undefined) updateData.vocabulary_theme = input.vocabulary_theme?.trim() || null;
  if (input.l1_l2_issues !== undefined) updateData.l1_l2_issues = input.l1_l2_issues?.trim() || null;
  if (input.prerequisites !== undefined) updateData.prerequisites = input.prerequisites?.trim() || null;
  if (input.learning_objectives !== undefined) updateData.learning_objectives = input.learning_objectives?.trim() || null;
  if (input.notes_for_teacher_or_ai !== undefined) updateData.notes_for_teacher_or_ai = input.notes_for_teacher_or_ai?.trim() || null;

  // Validate update data using schema (partial validation)
  const validationResult = lessonInputSchema.partial().safeParse(updateData);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return { data: null, error: `Validation error: ${firstError.message}` };
  }

  const { data, error } = await supabase
    .from("lessons")
    .update(validationResult.data)
    .eq("id", id)
    .select(LESSON_FIELDS_FULL)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: `No lesson found with id "${id}"` };
  }

  return { data: toLesson(data as LessonData), error: null };
}

/**
 * Delete a lesson by ID with cascading deletes
 * Deletes slides, groups, and the lesson itself
 * Order: child → parent (slides → groups → lesson)
 * 
 * Note: DB has FK constraint user_lessons.lesson_id → lessons.id ON DELETE CASCADE,
 * so user_lessons records are automatically deleted by the database when the lesson is deleted.
 * No manual deletion of user_lessons is needed.
 */
export async function deleteLesson(id: string): Promise<LessonResult<void>> {
  // Delete all slides for this lesson
  const { error: slidesError } = await supabase
    .from("slides")
    .delete()
    .eq("lesson_id", id);

  if (slidesError) {
    return { data: null, error: `Failed to delete slides: ${slidesError.message}` };
  }

  // Delete all groups for this lesson
  const { error: groupsError } = await supabase
    .from("lesson_groups")
    .delete()
    .eq("lesson_id", id);

  if (groupsError) {
    return { data: null, error: `Failed to delete groups: ${groupsError.message}` };
  }

  // Finally, delete the lesson
  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

