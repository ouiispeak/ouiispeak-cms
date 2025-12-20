import { supabase } from "../supabase";
import { moduleInputSchema } from "../schemas/moduleSchema";
import type { Module } from "../domain/module";
import { toModule } from "../mappers/moduleMapper";

/**
 * Standard fields to select from modules table
 * Centralized to avoid repetition across pages
 */
const MODULE_FIELDS = "id, slug, title, level, order_index, status, visibility, description, module_goal, core_topics, author_notes";

/**
 * Type for module data returned from the database
 */
export type ModuleData = {
  id: string;
  slug: string;
  title: string;
  level: string | null;
  order_index: number | null;
  status: string | null;
  visibility: string | null;
  description: string | null;
  module_goal: string | null;
  core_topics: string | null;
  author_notes: string | null;
};

/**
 * Type for creating a new module
 */
export type CreateModuleInput = {
  title: string;
  slug: string;
  level?: string | null;
  order_index?: number | null;
  description?: string | null;
  status?: string | null;
  visibility?: string | null;
  module_goal?: string | null;
  core_topics?: string | null;
  author_notes?: string | null;
};

/**
 * Type for updating a module
 */
export type UpdateModuleInput = Partial<CreateModuleInput>;

/**
 * Result type for data operations
 */
export type ModuleResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Load all modules, ordered by order_index
 * Returns domain models (camelCase)
 */
export async function loadModules(): Promise<ModuleResult<Module[]>> {
  const { data, error } = await supabase
    .from("modules")
    .select(MODULE_FIELDS)
    .order("order_index", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  const rows = (data ?? []) as ModuleData[];
  return { data: rows.map(toModule), error: null };
}

/**
 * Load a single module by ID
 * Returns domain model (camelCase)
 */
export async function loadModuleById(id: string): Promise<ModuleResult<Module>> {
  const { data, error } = await supabase
    .from("modules")
    .select(MODULE_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: `No module found with id "${id}"` };
  }

  return { data: toModule(data as ModuleData), error: null };
}

/**
 * Create a new module
 * Returns domain model (camelCase)
 */
export async function createModule(input: CreateModuleInput): Promise<ModuleResult<Module>> {
  // Validate input using schema
  // Apply defaults for required NOT NULL fields: status and visibility
  const validationResult = moduleInputSchema.safeParse({
    title: input.title.trim(),
    slug: input.slug.trim(),
    level: input.level?.trim() || null,
    order_index: input.order_index ?? null,
    description: input.description?.trim() || null,
    status: input.status || "draft", // Default to "draft" for required NOT NULL field
    visibility: input.visibility || "private", // Default to "private" for required NOT NULL field
    module_goal: input.module_goal?.trim() || null,
    core_topics: input.core_topics?.trim() || null,
    author_notes: input.author_notes?.trim() || null,
  });

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return { data: null, error: `Validation error: ${firstError.message}` };
  }

  const { data, error } = await supabase
    .from("modules")
    .insert(validationResult.data)
    .select(MODULE_FIELDS)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Insert succeeded but no data returned" };
  }

  return { data: toModule(data as ModuleData), error: null };
}

/**
 * Update an existing module
 * Returns domain model (camelCase)
 */
export async function updateModule(
  id: string,
  input: UpdateModuleInput
): Promise<ModuleResult<Module>> {
  // Build update data object
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.slug !== undefined) updateData.slug = input.slug.trim();
  if (input.level !== undefined) updateData.level = input.level?.trim() || null;
  if (input.order_index !== undefined) updateData.order_index = input.order_index;
  if (input.description !== undefined) updateData.description = input.description?.trim() || null;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.visibility !== undefined) updateData.visibility = input.visibility;
  if (input.module_goal !== undefined) updateData.module_goal = input.module_goal?.trim() || null;
  if (input.core_topics !== undefined) updateData.core_topics = input.core_topics?.trim() || null;
  if (input.author_notes !== undefined) updateData.author_notes = input.author_notes?.trim() || null;

  // Validate update data using schema (partial validation)
  const validationResult = moduleInputSchema.partial().safeParse(updateData);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return { data: null, error: `Validation error: ${firstError.message}` };
  }

  const { data, error } = await supabase
    .from("modules")
    .update(validationResult.data)
    .eq("id", id)
    .select(MODULE_FIELDS)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: `No module found with id "${id}"` };
  }

  return { data: toModule(data as ModuleData), error: null };
}

/**
 * Delete a module by ID with cascading deletes
 * Deletes all lessons, groups, and slides associated with the module
 * 
 * Note: DB has FK constraint user_lessons.lesson_id → lessons.id ON DELETE CASCADE,
 * so user_lessons records are automatically deleted by the database when lessons are deleted.
 * No manual deletion of user_lessons is needed.
 */
export async function deleteModule(id: string): Promise<ModuleResult<void>> {
  // Get all lessons for this module
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", id);

  if (lessonsError) {
    return { data: null, error: `Failed to load lessons: ${lessonsError.message}` };
  }

  const lessonIds = lessons?.map((l) => l.id) ?? [];

  // Delete all slides for these lessons
  if (lessonIds.length > 0) {
    const { error: slidesError } = await supabase
      .from("slides")
      .delete()
      .in("lesson_id", lessonIds);

    if (slidesError) {
      return { data: null, error: `Failed to delete slides: ${slidesError.message}` };
    }
  }

  // Delete all groups for these lessons
  if (lessonIds.length > 0) {
    const { error: groupsError } = await supabase
      .from("lesson_groups")
      .delete()
      .in("lesson_id", lessonIds);

    if (groupsError) {
      return { data: null, error: `Failed to delete groups: ${groupsError.message}` };
    }
  }

  // Delete all lessons for this module
  const { error: lessonsDeleteError } = await supabase
    .from("lessons")
    .delete()
    .eq("module_id", id);

  if (lessonsDeleteError) {
    return { data: null, error: `Failed to delete lessons: ${lessonsDeleteError.message}` };
  }

  // Finally, delete the module
  const { error } = await supabase
    .from("modules")
    .delete()
    .eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

