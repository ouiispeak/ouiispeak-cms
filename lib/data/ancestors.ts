import { loadModuleById } from "./modules";
import { loadLessonById } from "./lessons";
import { loadGroupById } from "./groups";
import { loadSlideById } from "./slides";
import type { Module } from "../domain/module";
import type { Lesson } from "../domain/lesson";
import type { Group } from "../domain/group";
import type { Slide } from "../domain/slide";

/**
 * Ancestor chain for a lesson
 */
export type LessonAncestors = {
  module: Module;
  lesson: Lesson;
};

/**
 * Ancestor chain for a group
 */
export type GroupAncestors = {
  module: Module;
  lesson: Lesson;
  group: Group;
};

/**
 * Ancestor chain for a slide
 */
export type SlideAncestors = {
  module: Module;
  lesson: Lesson;
  group?: Group;
  slide: Slide;
};

/**
 * Result type for ancestor operations
 */
export type AncestorResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Get ancestors for a lesson (module + lesson)
 */
export async function getAncestorsForLesson(lessonId: string): Promise<AncestorResult<LessonAncestors>> {
  const { data: lesson, error: lessonError } = await loadLessonById(lessonId);

  if (lessonError || !lesson) {
    return { data: null, error: lessonError || "Lesson not found" };
  }

  if (!lesson.moduleId) {
    return { data: null, error: "Lesson has no moduleId" };
  }

  const { data: module, error: moduleError } = await loadModuleById(lesson.moduleId);

  if (moduleError || !module) {
    return { data: null, error: moduleError || "Module not found" };
  }

  return {
    data: {
      module,
      lesson,
    },
    error: null,
  };
}

/**
 * Get ancestors for a group (module + lesson + group)
 */
export async function getAncestorsForGroup(groupId: string): Promise<AncestorResult<GroupAncestors>> {
  const { data: group, error: groupError } = await loadGroupById(groupId);

  if (groupError || !group) {
    return { data: null, error: groupError || "Group not found" };
  }

  if (!group.lessonId) {
    return { data: null, error: "Group has no lessonId" };
  }

  const ancestorsResult = await getAncestorsForLesson(group.lessonId);

  if (ancestorsResult.error || !ancestorsResult.data) {
    return ancestorsResult as AncestorResult<GroupAncestors>;
  }

  return {
    data: {
      ...ancestorsResult.data,
      group,
    },
    error: null,
  };
}

/**
 * Get ancestors for a slide (module + lesson + group? + slide)
 */
export async function getAncestorsForSlide(slideId: string): Promise<AncestorResult<SlideAncestors>> {
  const { data: slide, error: slideError } = await loadSlideById(slideId);

  if (slideError || !slide) {
    return { data: null, error: slideError || "Slide not found" };
  }

  if (!slide.lessonId) {
    return { data: null, error: "Slide has no lessonId" };
  }

  const ancestorsResult = await getAncestorsForLesson(slide.lessonId);

  if (ancestorsResult.error || !ancestorsResult.data) {
    return ancestorsResult as AncestorResult<SlideAncestors>;
  }

  // Optionally load group if slide has groupId
  let group: Group | undefined = undefined;
  if (slide.groupId) {
    const { data: groupData, error: groupError } = await loadGroupById(slide.groupId);
    if (!groupError && groupData) {
      group = groupData;
    }
  }

  return {
    data: {
      ...ancestorsResult.data,
      group,
      slide,
    },
    error: null,
  };
}

