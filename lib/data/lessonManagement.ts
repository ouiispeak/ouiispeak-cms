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
 * Load all data needed for the lesson management page
 * Returns lesson, groups, slides (all ordered), and unique slide types
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
        .map((s: any) => (s.type || "").trim())
        .filter((t: string) => t.length > 0)
    ).add("default")
  ).sort();

  return {
    data: {
      lesson: { id: lesson.id, title: lesson.title },
      groups: (groups ?? []).map((g: any) => toGroupMinimal({
        id: g.id,
        lesson_id: g.lesson_id,
        order_index: g.order_index,
        label: g.label,
        title: g.title,
      })),
      slides: (slides ?? []).map((s: any) => ({
        id: s.id,
        lessonId: s.lesson_id,
        groupId: s.group_id,
        orderIndex: s.order_index,
        type: s.type,
        propsJson: s.props_json,
      })),
      slideTypes: uniqueTypes,
    },
    error: null,
  };
}
