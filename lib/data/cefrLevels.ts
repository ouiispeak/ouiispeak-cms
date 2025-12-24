import { supabase } from "../supabase";
import { cefrLevelInputSchema } from "../schemas/cefrLevelSchema";
import type { CefrLevel } from "../domain/cefrLevel";

/**
 * Standard fields to select from cefr_levels table
 */
const CEFR_LEVEL_FIELDS = "level, status, visibility, description, author_notes";

/**
 * Type for CEFR level data returned from the database
 */
export type CefrLevelData = {
  level: string;
  status: "draft" | "published" | "archived" | null;
  visibility: "private" | "beta" | "public" | null;
  description: string | null;
  author_notes: string | null;
};

/**
 * Type for creating/updating a CEFR level
 */
export type CreateCefrLevelInput = {
  level: string;
  status?: "draft" | "published" | "archived" | null;
  visibility?: "private" | "beta" | "public" | null;
  description?: string | null;
  author_notes?: string | null;
};

export type UpdateCefrLevelInput = Partial<CreateCefrLevelInput>;

/**
 * Result type for data operations
 */
export type CefrLevelResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Map database row to domain model
 */
function toCefrLevel(row: CefrLevelData): CefrLevel {
  return {
    level: row.level,
    status: row.status,
    visibility: row.visibility,
    description: row.description,
    authorNotes: row.author_notes,
  };
}

/**
 * Load a CEFR level by level code (e.g., "A0", "A1")
 * Returns domain model (camelCase)
 */
export async function loadCefrLevelByLevel(level: string): Promise<CefrLevelResult<CefrLevel>> {
  const { data, error } = await supabase
    .from("cefr_levels")
    .select(CEFR_LEVEL_FIELDS)
    .eq("level", level.toUpperCase())
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: null }; // Not found is not an error, just empty
  }

  return { data: toCefrLevel(data as CefrLevelData), error: null };
}

/**
 * Create or update a CEFR level (upsert)
 * Returns domain model (camelCase)
 */
export async function upsertCefrLevel(
  input: CreateCefrLevelInput | UpdateCefrLevelInput
): Promise<CefrLevelResult<CefrLevel>> {
  const updateData: Record<string, unknown> = {};

  if (input.level !== undefined) updateData.level = input.level.toUpperCase();
  if (input.status !== undefined) updateData.status = input.status;
  if (input.visibility !== undefined) updateData.visibility = input.visibility;
  if (input.description !== undefined) updateData.description = input.description?.trim() || null;
  if (input.author_notes !== undefined) updateData.author_notes = input.author_notes?.trim() || null;

  // Validate update data using schema
  const validationResult = cefrLevelInputSchema.partial().safeParse(updateData);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return { data: null, error: `Validation error: ${firstError.message}` };
  }

  // Use upsert to create or update
  const { data, error } = await supabase
    .from("cefr_levels")
    .upsert(validationResult.data, { onConflict: "level" })
    .select(CEFR_LEVEL_FIELDS)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: `Failed to save CEFR level` };
  }

  return { data: toCefrLevel(data as CefrLevelData), error: null };
}

