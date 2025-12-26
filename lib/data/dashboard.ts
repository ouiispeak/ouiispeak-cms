import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "../supabase";
import { loadModules } from "./modules";
import { loadLessonsByModule } from "./lessons";
import { loadGroupsByLesson } from "./groups";
import { toLesson } from "../mappers/lessonMapper";
import { toSlideMinimal } from "../mappers/slideMapper";
import type { Module } from "../domain/module";
import type { LessonForHierarchy, SlideForHierarchy } from "./buildHierarchy";
import type { GroupMinimal } from "../domain/group";
import type { LessonData } from "./lessons";
import type { SlideDataMinimal } from "./slides";

/**
 * Result type for dashboard data operations
 */
export type DashboardResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Dashboard data structure
 */
export type DashboardData = {
  modules: Module[];
  lessons: LessonForHierarchy[];
  groups: GroupMinimal[];
  slides: SlideForHierarchy[];
};

/**
 * Load all data needed for the CMS dashboard
 * Returns domain types (camelCase)
 */
export async function loadDashboardData(): Promise<DashboardResult<DashboardData>> {
  noStore();
  try {
    // Load all modules
    const modulesResult = await loadModules();
    if (modulesResult.error || !modulesResult.data) {
      return { data: null, error: `Modules error: ${modulesResult.error || "Failed to load modules"}` };
    }

    const modules = modulesResult.data;

    // Load lessons for each module
    const lessonPromises = modules.map((mod) => loadLessonsByModule(mod.id));
    const lessonResults = await Promise.all(lessonPromises);

    // Combine all lessons and map to domain types with moduleId
    const lessons: LessonForHierarchy[] = [];
    for (let i = 0; i < modules.length; i++) {
      const result = lessonResults[i];
      if (result.data) {
        for (const lessonData of result.data as LessonData[]) {
          const lesson = toLesson(lessonData);
          lessons.push({
            id: lesson.id,
            slug: lesson.slug,
            label: lesson.label,
            title: lesson.title,
            moduleId: modules[i].id,
            orderIndex: lessonData.order_index,
          });
        }
      }
    }

    // Load groups for all lessons
    const lessonIds = lessons.map((l) => l.id).filter((id): id is string => !!id);
    const groupPromises = lessonIds.map((lid) => loadGroupsByLesson(lid));
    const groupResults = await Promise.all(groupPromises);

    // Combine all groups
    const groups: GroupMinimal[] = [];
    for (const result of groupResults) {
      if (result.data) {
        groups.push(...result.data);
      }
    }

    // Load slides for all lessons (with propsJson for title extraction)
    // Skip query if no valid lesson IDs (empty DB or no lessons)
    let slides: SlideForHierarchy[] = [];
    if (lessonIds.length > 0) {
      // Validate that all lesson IDs are valid UUIDs before querying
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validLessonIds = lessonIds.filter((id) => id && uuidRegex.test(id));
      
      if (validLessonIds.length > 0) {
        const { data: slidesData, error: slidesError } = await supabase
          .from("slides")
          .select("id, lesson_id, group_id, order_index, type, props_json")
          .in("lesson_id", validLessonIds)
          .order("order_index", { ascending: true });

        if (slidesError) {
          return { data: null, error: `Slides error: ${slidesError.message}` };
        }

        // Map slides to domain types with propsJson
        slides = (slidesData ?? []).map((row: { id: string; lesson_id: string | null; group_id: string | null; order_index: number | null; type: string; props_json: unknown }) => ({
          ...toSlideMinimal({
            id: row.id,
            lesson_id: row.lesson_id,
            group_id: row.group_id,
            order_index: row.order_index,
            type: row.type,
          }),
          propsJson: row.props_json,
        }));
      }
      // If no valid UUIDs, slides remains empty array (no error)
    }
    // If no lesson IDs at all, slides remains empty array (no error)

    return {
      data: {
        modules,
        lessons,
        groups,
        slides,
      },
      error: null,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error loading dashboard data";
    return {
      data: null,
      error: errorMessage,
    };
  }
}

