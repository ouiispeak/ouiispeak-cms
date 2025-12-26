import { supabase } from "../supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Impact counts for module deletion
 */
export type ModuleDeleteImpact = {
  lessons: number;
  groups: number;
  slides: number;
  user_lessons: number;
};

/**
 * Impact counts for lesson deletion
 */
export type LessonDeleteImpact = {
  groups: number;
  slides: number;
  user_lessons: number;
};

/**
 * Impact counts for group deletion
 */
export type GroupDeleteImpact = {
  slides: number;
};

/**
 * Result type for impact queries
 */
export type ImpactResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Calculates the impact of deleting a module.
 * 
 * Returns counts of all dependent records that would be deleted:
 * - Lessons in the module
 * - Groups in those lessons
 * - Slides in those lessons
 * - User lesson progress records
 * 
 * Used to show users what will be deleted before confirming deletion.
 * 
 * @param moduleId - The ID of the module to check
 * @param client - Optional Supabase client (defaults to global client)
 * 
 * @returns Promise resolving to impact counts or an error
 * 
 * @example
 * ```tsx
 * const { data, error } = await getModuleDeleteImpact("module-123");
 * if (data) {
 *   console.log(`Deleting will remove ${data.lessons} lessons, ${data.slides} slides`);
 * }
 * ```
 * 
 * @remarks
 * - Gracefully handles missing `user_lessons` table (returns 0 if table doesn't exist)
 * - Uses efficient count queries (head: true) to avoid loading full data
 * - Returns 0 counts if module has no lessons
 */
export async function getModuleDeleteImpact(
  moduleId: string,
  client: SupabaseClient = supabase
): Promise<ImpactResult<ModuleDeleteImpact>> {
  try {
    // Get all lessons for this module
    const { data: lessons, error: lessonsError } = await client
      .from("lessons")
      .select("id")
      .eq("module_id", moduleId);

    if (lessonsError) {
      return { data: null, error: lessonsError.message };
    }

    const lessonIds = lessons?.map((l) => l.id) ?? [];
    const lessonsCount = lessonIds.length;

    // Count groups for these lessons
    let groupsCount = 0;
    if (lessonIds.length > 0) {
      const { count, error: groupsError } = await client
        .from("lesson_groups")
        .select("*", { count: "exact", head: true })
        .in("lesson_id", lessonIds);

      if (groupsError) {
        return { data: null, error: groupsError.message };
      }
      groupsCount = count ?? 0;
    }

    // Count slides for these lessons
    let slidesCount = 0;
    if (lessonIds.length > 0) {
      const { count, error: slidesError } = await client
        .from("slides")
        .select("*", { count: "exact", head: true })
        .in("lesson_id", lessonIds);

      if (slidesError) {
        return { data: null, error: slidesError.message };
      }
      slidesCount = count ?? 0;
    }

    // Count user_lessons (if table exists, gracefully handle if it doesn't)
    let userLessonsCount = 0;
    if (lessonIds.length > 0) {
      try {
        const { count: userLessons, error: userLessonsError } = await client
          .from("user_lessons")
          .select("*", { count: "exact", head: true })
          .in("lesson_id", lessonIds);

        if (!userLessonsError && userLessons !== null) {
          userLessonsCount = userLessons;
        }
      } catch {
        // Table might not exist, ignore
      }
    }

    return {
      data: {
        lessons: lessonsCount,
        groups: groupsCount,
        slides: slidesCount,
        user_lessons: userLessonsCount,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get impact counts for deleting a lesson
 * Returns counts of groups, slides, and user_lessons that will be deleted
 */
export async function getLessonDeleteImpact(
  lessonId: string,
  client: SupabaseClient = supabase
): Promise<ImpactResult<LessonDeleteImpact>> {
  try {
    // Count groups for this lesson
    const { count: groupsCount, error: groupsError } = await client
      .from("lesson_groups")
      .select("*", { count: "exact", head: true })
      .eq("lesson_id", lessonId);

    if (groupsError) {
      return { data: null, error: groupsError.message };
    }

    // Count slides for this lesson
    const { count: slidesCount, error: slidesError } = await client
      .from("slides")
      .select("*", { count: "exact", head: true })
      .eq("lesson_id", lessonId);

    if (slidesError) {
      return { data: null, error: slidesError.message };
    }

    // Count user_lessons (if table exists, gracefully handle if it doesn't)
    let userLessonsCount = 0;
    try {
      const { count: userLessons, error: userLessonsError } = await client
        .from("user_lessons")
        .select("*", { count: "exact", head: true })
        .eq("lesson_id", lessonId);

      if (!userLessonsError && userLessons !== null) {
        userLessonsCount = userLessons;
      }
    } catch {
      // Table might not exist, ignore
    }

    return {
      data: {
        groups: groupsCount ?? 0,
        slides: slidesCount ?? 0,
        user_lessons: userLessonsCount,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Calculates the impact of deleting a group.
 * 
 * Returns the count of slides that would be deleted.
 * 
 * Used to show users what will be deleted before confirming deletion.
 * 
 * @param groupId - The ID of the group to check
 * @param client - Optional Supabase client (defaults to global client)
 * 
 * @returns Promise resolving to impact count or an error
 * 
 * @remarks
 * - Uses efficient count query (head: true) to avoid loading full data
 */
export async function getGroupDeleteImpact(
  groupId: string,
  client: SupabaseClient = supabase
): Promise<ImpactResult<GroupDeleteImpact>> {
  try {
    // Count slides for this group
    const { count: slidesCount, error: slidesError } = await client
      .from("slides")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);

    if (slidesError) {
      return { data: null, error: slidesError.message };
    }

    return {
      data: {
        slides: slidesCount ?? 0,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

