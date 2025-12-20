import { supabase } from "../supabase";
import { loadModules } from "./modules";
import { loadLessonsByModule } from "./lessons";
import { loadGroupsByLesson } from "./groups";
import { toLessonMinimal } from "../mappers/lessonMapper";
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
          lessons.push({
            ...toLessonMinimal({
              id: lessonData.id,
              slug: lessonData.slug,
              title: lessonData.title,
            }),
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
    const { data: slidesData, error: slidesError } = await supabase
      .from("slides")
      .select("id, lesson_id, group_id, order_index, type, props_json")
      .in("lesson_id", lessonIds.length > 0 ? lessonIds : ["__no_match__"])
      .order("order_index", { ascending: true });

    if (slidesError) {
      return { data: null, error: `Slides error: ${slidesError.message}` };
    }

    // Map slides to domain types with propsJson
    const slides: SlideForHierarchy[] = (slidesData ?? []).map((row: any) => ({
      ...toSlideMinimal({
        id: row.id,
        lesson_id: row.lesson_id,
        group_id: row.group_id,
        order_index: row.order_index,
        type: row.type,
      }),
      propsJson: row.props_json,
    }));

    return {
      data: {
        modules,
        lessons,
        groups,
        slides,
      },
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || "Unknown error loading dashboard data",
    };
  }
}

