import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "../supabase";
import { loadModules, loadModulesPaginated, type PaginationMeta } from "./modules";
import { loadLessonsByModule } from "./lessons";
import { loadGroupsByLesson } from "./groups";
import { toLesson } from "../mappers/lessonMapper";
import { toSlideMinimal } from "../mappers/slideMapper";
import type { Module } from "../domain/module";
import type { LessonForHierarchy, SlideForHierarchy } from "./buildHierarchy";
import type { GroupMinimal } from "../domain/group";
import type { LessonData } from "./lessons";
import type { SlideDataMinimal } from "./slides";
import { validateSlidePropsRuntime } from "../utils/validateSlideProps";
import { logger } from "../utils/logger";

/**
 * Result type for dashboard data operations
 */
export type DashboardResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Paginated dashboard result type
 */
export type PaginatedDashboardResult<T> = {
  data: T | null;
  error: string | null;
  meta: PaginationMeta | null;
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
 * Loads all data needed for the CMS dashboard.
 * 
 * This function orchestrates loading the complete content hierarchy:
 * - All modules
 * - All lessons (organized by module)
 * - All groups (for all lessons)
 * - All slides (for all lessons, with propsJson for display)
 * 
 * All data is loaded in parallel where possible for optimal performance.
 * 
 * @returns Promise resolving to a DashboardResult containing the complete hierarchy
 * 
 * @example
 * ```tsx
 * const { data, error } = await loadDashboardData();
 * if (error) {
 *   console.error("Failed to load dashboard:", error);
 * } else {
 *   console.log(`Loaded ${data.modules.length} modules`);
 * }
 * ```
 * 
 * @remarks
 * - Uses `noStore()` to prevent Next.js caching (ensures fresh data)
 * - Validates UUIDs before querying slides to prevent SQL errors
 * - Returns domain models (camelCase) rather than database rows
 * - Handles empty database gracefully (returns empty arrays)
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
        // Tier 3.2 Step 2: Validate props_json at runtime
        slides = (slidesData ?? []).map((row: { id: string; lesson_id: string | null; group_id: string | null; order_index: number | null; type: string; props_json: unknown }) => {
          // Validate props_json (non-breaking - logs warnings only)
          const validation = validateSlidePropsRuntime(row.type, row.props_json, row.id);
          if (!validation.valid) {
            logger.warn("[Dashboard Slide Props Validation]", {
              slideId: row.id,
              slideType: row.type,
              errors: validation.errors,
              warnings: validation.warnings,
            });
          }

          return {
            ...toSlideMinimal({
              id: row.id,
              lesson_id: row.lesson_id,
              group_id: row.group_id,
              order_index: row.order_index,
              type: row.type,
            }),
            propsJson: row.props_json,
          };
        });
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

/**
 * Tier 2.1 Step 3: Loads paginated dashboard data.
 * 
 * This function loads a paginated subset of modules and all their children:
 * - Paginated modules (based on page and pageSize)
 * - All lessons for those modules
 * - All groups for those lessons
 * - All slides for those lessons (with propsJson for display)
 * 
 * This maintains the hierarchy while allowing pagination at the module level.
 * 
 * @param page - 1-indexed page number (default: 1)
 * @param pageSize - Number of modules per page (default: 50)
 * @returns Promise resolving to a PaginatedDashboardResult containing the hierarchy
 * 
 * @example
 * ```tsx
 * const { data, error, meta } = await loadDashboardDataPaginated(1, 10);
 * if (error) {
 *   console.error("Failed to load dashboard:", error);
 * } else {
 *   console.log(`Loaded ${data.modules.length} modules (page ${meta.page} of ${meta.totalPages})`);
 * }
 * ```
 * 
 * @remarks
 * - Uses `noStore()` to prevent Next.js caching (ensures fresh data)
 * - Validates UUIDs before querying slides to prevent SQL errors
 * - Returns domain models (camelCase) rather than database rows
 * - Handles empty database gracefully (returns empty arrays)
 */
export async function loadDashboardDataPaginated(
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedDashboardResult<DashboardData>> {
  noStore();
  try {
    // Load paginated modules
    const modulesResult = await loadModulesPaginated(page, pageSize);
    if (modulesResult.error || !modulesResult.data || !modulesResult.meta) {
      return { 
        data: null, 
        error: `Modules error: ${modulesResult.error || "Failed to load modules"}`,
        meta: null
      };
    }

    const modules = modulesResult.data;
    const paginationMeta = modulesResult.meta;

    // Load lessons for each module (same as non-paginated version)
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

    // Load groups for all lessons (same as non-paginated version)
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
          return { data: null, error: `Slides error: ${slidesError.message}`, meta: null };
        }

        // Map slides to domain types with propsJson
        // Tier 3.2 Step 2: Validate props_json at runtime
        slides = (slidesData ?? []).map((row: { id: string; lesson_id: string | null; group_id: string | null; order_index: number | null; type: string; props_json: unknown }) => {
          // Validate props_json (non-breaking - logs warnings only)
          const validation = validateSlidePropsRuntime(row.type, row.props_json, row.id);
          if (!validation.valid) {
            logger.warn("[Dashboard Slide Props Validation]", {
              slideId: row.id,
              slideType: row.type,
              errors: validation.errors,
              warnings: validation.warnings,
            });
          }

          return {
            ...toSlideMinimal({
              id: row.id,
              lesson_id: row.lesson_id,
              group_id: row.group_id,
              order_index: row.order_index,
              type: row.type,
            }),
            propsJson: row.props_json,
          };
        });
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
      meta: paginationMeta,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error loading dashboard data";
    return {
      data: null,
      error: errorMessage,
      meta: null,
    };
  }
}

