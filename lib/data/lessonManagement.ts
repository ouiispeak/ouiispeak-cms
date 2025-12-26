import { supabase } from "../supabase";
import type { GroupMinimal } from "../domain/group";
import { toGroupMinimal } from "../mappers/groupMapper";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Result type for lesson management data operations
 */
export type LessonManagementResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Data structure returned by loadLessonManagement
 * Returns domain models (camelCase)
 * Note: slides include propsJson for display purposes
 */
export type LessonManagementSlide = {
  id: string;
  lessonId: string | null;
  groupId: string | null;
  orderIndex: number | null;
  type: string;
  propsJson?: unknown;
};

export type LessonManagementData = {
  lesson: { id: string; title: string };
  groups: GroupMinimal[];
  slides: LessonManagementSlide[];
  slideTypes: string[];
};

/**
 * Loads all data needed for the lesson management page.
 * 
 * This function performs parallel queries to fetch:
 * - Lesson information (id, title)
 * - All groups for the lesson (ordered by order_index)
 * - All slides for the lesson (ordered by order_index)
 * - All unique slide types from the entire database (for dropdown)
 * 
 * @param lessonId - The ID of the lesson to load data for
 * @param client - Optional Supabase client (defaults to the global client)
 * 
 * @returns Promise resolving to a LessonManagementResult containing:
 *   - `lesson`: Basic lesson info (id, title)
 *   - `groups`: Array of groups (ordered by order_index)
 *   - `slides`: Array of slides (ordered by order_index) with propsJson included
 *   - `slideTypes`: Array of unique slide types (sorted alphabetically)
 * 
 * @example
 * ```tsx
 * const { data, error } = await loadLessonManagement("lesson-123");
 * if (error) {
 *   console.error("Failed to load:", error);
 * } else {
 *   console.log(`Loaded ${data.slides.length} slides for lesson ${data.lesson.title}`);
 * }
 * ```
 * 
 * @remarks
 * - All queries run in parallel for better performance
 * - Slide types are extracted from the entire database, not just this lesson
 * - Empty and null slide types are filtered out
 * - Returns domain models (camelCase) rather than database rows (snake_case)
 */
export async function loadLessonManagement(
  lessonId: string,
  client: SupabaseClient = supabase
): Promise<LessonManagementResult<LessonManagementData>> {
  const [
    { data: lesson, error: lessonError },
    { data: slides, error: slidesError },
    { data: groups, error: groupsError },
    { data: allSlides, error: allSlidesError },
  ] = await Promise.all([
    client
      .from("lessons")
      .select("id, title")
      .eq("id", lessonId)
      .maybeSingle(),
    client
      .from("slides")
      .select("id, type, props_json, order_index, group_id, lesson_id")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true }),
    client
      .from("lesson_groups")
      .select("id, title, order_index")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true }),
    // Get all distinct slide types from the entire database
    client
      .from("slides")
      .select("type")
      .not("type", "is", null),
  ]);

  if (lessonError) {
    return { data: null, error: lessonError.message };
  }

  if (!lesson) {
    return { data: null, error: "Lesson not found" };
  }

  if (slidesError) {
    return { data: null, error: slidesError.message };
  }

  if (groupsError) {
    return { data: null, error: groupsError.message };
  }

  if (allSlidesError) {
    return { data: null, error: allSlidesError.message };
  }

  // Extract unique slide types, trim whitespace, and filter out empty strings
  const uniqueTypes = Array.from(
    new Set(
      (allSlides ?? [])
        .map((s) => {
          const slideRow = s as { type: string | null };
          return (slideRow.type || "").trim();
        })
        .filter((t: string) => t.length > 0)
    )
  ).sort();

  return {
    data: {
      lesson: { id: lesson.id, title: lesson.title },
      groups: (groups ?? []).map((g) => {
        // Type assertion for Supabase response
        const groupRow = g as { id: string; lesson_id: string; order_index: number | null; label: string | null; title: string };
        return toGroupMinimal({
          id: groupRow.id,
          lesson_id: groupRow.lesson_id,
          order_index: groupRow.order_index,
          label: groupRow.label,
          title: groupRow.title,
        });
      }),
      slides: (slides ?? []).map((s) => {
        // Type assertion for Supabase response
        const slideRow = s as { id: string; lesson_id: string | null; group_id: string | null; order_index: number | null; type: string; props_json: unknown };
        return {
          id: slideRow.id,
          lessonId: slideRow.lesson_id,
          groupId: slideRow.group_id,
          orderIndex: slideRow.order_index,
          type: slideRow.type,
          propsJson: slideRow.props_json,
        };
      }),
      slideTypes: uniqueTypes,
    },
    error: null,
  };
}
