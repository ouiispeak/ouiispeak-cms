import type { Module } from "../domain/module";
import type { LessonMinimal } from "../domain/lesson";
import type { GroupMinimal } from "../domain/group";
import type { SlideMinimal } from "../domain/slide";

/**
 * Extended lesson type for dashboard (includes moduleId)
 */
export type LessonForHierarchy = LessonMinimal & {
  moduleId: string | null;
  orderIndex: number | null;
};

/**
 * Extended slide type for dashboard (includes propsJson for title extraction)
 */
export type SlideForHierarchy = SlideMinimal & {
  propsJson?: unknown;
};

/**
 * Hierarchy structure returned by buildCmsHierarchy
 * Uses domain types (camelCase)
 */
export interface CmsHierarchyMaps {
  modulesByLevel: Map<string, Module[]>;
  lessonsByModule: Map<string, LessonForHierarchy[]>;
  groupsByLesson: Map<string, GroupMinimal[]>;
  slidesByGroup: Map<string, SlideForHierarchy[]>;
  ungroupedSlidesByLesson: Map<string, SlideForHierarchy[]>;
}

/**
 * Builds hierarchical maps from flat arrays of modules, lessons, groups, and slides.
 * Groups items by their parent relationships and sorts them by orderIndex.
 * Uses domain types (camelCase).
 *
 * @param modules - Array of module domain objects
 * @param lessons - Array of lesson domain objects (must include moduleId and orderIndex)
 * @param groups - Array of group domain objects (minimal)
 * @param slides - Array of slide domain objects (must include propsJson for title extraction)
 * @returns Hierarchical maps grouping items by their parent relationships
 */
export function buildCmsHierarchy(
  modules: Module[],
  lessons: LessonForHierarchy[],
  groups: GroupMinimal[],
  slides: SlideForHierarchy[]
): CmsHierarchyMaps {
  // Build lessonsByModule map
  const lessonsByModule = new Map<string, LessonForHierarchy[]>();
  for (const lesson of lessons) {
    if (!lesson.moduleId) continue;
    const arr = lessonsByModule.get(lesson.moduleId) ?? [];
    arr.push(lesson);
    lessonsByModule.set(lesson.moduleId, arr);
  }
  // Sort lessons within each module
  for (const [mid, arr] of lessonsByModule.entries()) {
    arr.sort(
      (a, b) =>
        (a.orderIndex ?? 0) - (b.orderIndex ?? 0) ||
        a.id.localeCompare(b.id)
    );
    lessonsByModule.set(mid, arr);
  }

  // Build groupsByLesson map
  const groupsByLesson = new Map<string, GroupMinimal[]>();
  for (const group of groups) {
    if (!group.lessonId) continue;
    const arr = groupsByLesson.get(group.lessonId) ?? [];
    arr.push(group);
    groupsByLesson.set(group.lessonId, arr);
  }
  // Sort groups within each lesson
  for (const [lid, arr] of groupsByLesson.entries()) {
    arr.sort(
      (a, b) =>
        (a.orderIndex ?? 0) - (b.orderIndex ?? 0) ||
        a.id.localeCompare(b.id)
    );
    groupsByLesson.set(lid, arr);
  }

  // Build slidesByGroup and ungroupedSlidesByLesson maps
  const slidesByGroup = new Map<string, SlideForHierarchy[]>();
  const ungroupedSlidesByLesson = new Map<string, SlideForHierarchy[]>();

  for (const slide of slides) {
    if (slide.groupId) {
      const arr = slidesByGroup.get(slide.groupId) ?? [];
      arr.push(slide);
      slidesByGroup.set(slide.groupId, arr);
    } else if (slide.lessonId) {
      const arr = ungroupedSlidesByLesson.get(slide.lessonId) ?? [];
      arr.push(slide);
      ungroupedSlidesByLesson.set(slide.lessonId, arr);
    }
  }

  // Sort slides within each group
  for (const [gid, arr] of slidesByGroup.entries()) {
    arr.sort(
      (a, b) =>
        (a.orderIndex ?? 0) - (b.orderIndex ?? 0) ||
        a.id.localeCompare(b.id)
    );
    slidesByGroup.set(gid, arr);
  }

  // Sort ungrouped slides within each lesson
  for (const [lid, arr] of ungroupedSlidesByLesson.entries()) {
    arr.sort(
      (a, b) =>
        (a.orderIndex ?? 0) - (b.orderIndex ?? 0) ||
        a.id.localeCompare(b.id)
    );
    ungroupedSlidesByLesson.set(lid, arr);
  }

  // Build modulesByLevel map
  const modulesByLevel = new Map<string, Module[]>();
  for (const mod of modules) {
    const lvl = (mod.level ?? "").toUpperCase();
    const arr = modulesByLevel.get(lvl) ?? [];
    arr.push(mod);
    modulesByLevel.set(lvl, arr);
  }
  // Sort modules within each level
  for (const [lvl, arr] of modulesByLevel.entries()) {
    arr.sort(
      (a, b) =>
        (a.orderIndex ?? 0) - (b.orderIndex ?? 0) ||
        a.id.localeCompare(b.id)
    );
    modulesByLevel.set(lvl, arr);
  }

  return {
    modulesByLevel,
    lessonsByModule,
    groupsByLesson,
    slidesByGroup,
    ungroupedSlidesByLesson,
  };
}
