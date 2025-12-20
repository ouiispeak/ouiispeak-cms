import { describe, it, expect } from "vitest";
import { buildCmsHierarchy, type LessonForHierarchy, type SlideForHierarchy } from "./buildHierarchy";
import type { Module } from "../domain/module";
import type { GroupMinimal } from "../domain/group";

describe("buildCmsHierarchy", () => {
  it("groups slides by group_id and buckets ungrouped slides by lesson_id", () => {
    const modules: Module[] = [];
    const lessons: LessonForHierarchy[] = [
      { id: "lesson-1", moduleId: "module-1", title: "Lesson 1", slug: "lesson-1", orderIndex: 1 },
      { id: "lesson-2", moduleId: "module-1", title: "Lesson 2", slug: "lesson-2", orderIndex: 2 },
    ];
    const groups: GroupMinimal[] = [
      { id: "group-1", lessonId: "lesson-1", title: "Group 1", orderIndex: 1 },
      { id: "group-2", lessonId: "lesson-1", title: "Group 2", orderIndex: 2 },
    ];
    const slides: SlideForHierarchy[] = [
      { id: "slide-1", lessonId: "lesson-1", groupId: "group-1", type: "text", orderIndex: 1, propsJson: {} },
      { id: "slide-2", lessonId: "lesson-1", groupId: "group-1", type: "text", orderIndex: 2, propsJson: {} },
      { id: "slide-3", lessonId: "lesson-1", groupId: "group-2", type: "text", orderIndex: 1, propsJson: {} },
      { id: "slide-4", lessonId: "lesson-1", groupId: null, type: "text", orderIndex: 1, propsJson: {} },
      { id: "slide-5", lessonId: "lesson-2", groupId: null, type: "text", orderIndex: 1, propsJson: {} },
    ];

    const result = buildCmsHierarchy(modules, lessons, groups, slides);

    // Check grouped slides
    expect(result.slidesByGroup.get("group-1")).toHaveLength(2);
    expect(result.slidesByGroup.get("group-1")?.map(s => s.id)).toEqual(["slide-1", "slide-2"]);
    expect(result.slidesByGroup.get("group-2")).toHaveLength(1);
    expect(result.slidesByGroup.get("group-2")?.map(s => s.id)).toEqual(["slide-3"]);

    // Check ungrouped slides
    expect(result.ungroupedSlidesByLesson.get("lesson-1")).toHaveLength(1);
    expect(result.ungroupedSlidesByLesson.get("lesson-1")?.map(s => s.id)).toEqual(["slide-4"]);
    expect(result.ungroupedSlidesByLesson.get("lesson-2")).toHaveLength(1);
    expect(result.ungroupedSlidesByLesson.get("lesson-2")?.map(s => s.id)).toEqual(["slide-5"]);
  });

  it("respects order_index for sorting within groups", () => {
    const modules: Module[] = [];
    const lessons: LessonForHierarchy[] = [
      { id: "lesson-1", moduleId: "module-1", title: "Lesson 1", slug: "lesson-1", orderIndex: 1 },
    ];
    const groups: GroupMinimal[] = [
      { id: "group-1", lessonId: "lesson-1", title: "Group 1", orderIndex: 1 },
    ];
    const slides: SlideForHierarchy[] = [
      { id: "slide-3", lessonId: "lesson-1", groupId: "group-1", type: "text", orderIndex: 3, propsJson: {} },
      { id: "slide-1", lessonId: "lesson-1", groupId: "group-1", type: "text", orderIndex: 1, propsJson: {} },
      { id: "slide-2", lessonId: "lesson-1", groupId: "group-1", type: "text", orderIndex: 2, propsJson: {} },
    ];

    const result = buildCmsHierarchy(modules, lessons, groups, slides);

    const groupSlides = result.slidesByGroup.get("group-1");
    expect(groupSlides).toHaveLength(3);
    expect(groupSlides?.map(s => s.id)).toEqual(["slide-1", "slide-2", "slide-3"]);
  });

  it("falls back to id comparison when order_index is equal or null", () => {
    const modules: Module[] = [];
    const lessons: LessonForHierarchy[] = [
      { id: "lesson-1", moduleId: "module-1", title: "Lesson 1", slug: "lesson-1", orderIndex: 1 },
    ];
    const groups: GroupMinimal[] = [
      { id: "group-1", lessonId: "lesson-1", title: "Group 1", orderIndex: 1 },
    ];
    const slides: SlideForHierarchy[] = [
      { id: "slide-z", lessonId: "lesson-1", groupId: "group-1", type: "text", orderIndex: null, propsJson: {} },
      { id: "slide-a", lessonId: "lesson-1", groupId: "group-1", type: "text", orderIndex: null, propsJson: {} },
      { id: "slide-b", lessonId: "lesson-1", groupId: "group-1", type: "text", orderIndex: 1, propsJson: {} },
    ];

    const result = buildCmsHierarchy(modules, lessons, groups, slides);

    const groupSlides = result.slidesByGroup.get("group-1");
    expect(groupSlides).toHaveLength(3);
    // nulls are treated as 0, so they come first, sorted by id, then order_index 1
    expect(groupSlides?.map(s => s.id)).toEqual(["slide-a", "slide-z", "slide-b"]);
  });

  it("groups modules by level and sorts by order_index", () => {
    const modules: Module[] = [
      { id: "module-2", title: "Module 2", slug: "module-2", level: "beginner", orderIndex: 2, status: null, visibility: null, description: null, moduleGoal: null, coreTopics: null, authorNotes: null },
      { id: "module-1", title: "Module 1", slug: "module-1", level: "beginner", orderIndex: 1, status: null, visibility: null, description: null, moduleGoal: null, coreTopics: null, authorNotes: null },
      { id: "module-3", title: "Module 3", slug: "module-3", level: "advanced", orderIndex: 1, status: null, visibility: null, description: null, moduleGoal: null, coreTopics: null, authorNotes: null },
    ];
    const lessons: LessonForHierarchy[] = [];
    const groups: GroupMinimal[] = [];
    const slides: SlideForHierarchy[] = [];

    const result = buildCmsHierarchy(modules, lessons, groups, slides);

    const beginnerModules = result.modulesByLevel.get("BEGINNER");
    expect(beginnerModules).toHaveLength(2);
    expect(beginnerModules?.map(m => m.id)).toEqual(["module-1", "module-2"]);

    const advancedModules = result.modulesByLevel.get("ADVANCED");
    expect(advancedModules).toHaveLength(1);
    expect(advancedModules?.map(m => m.id)).toEqual(["module-3"]);
  });

  it("groups lessons by module_id and sorts by order_index", () => {
    const modules: Module[] = [
      { id: "module-1", title: "Module 1", slug: "module-1", level: "beginner", orderIndex: 1, status: null, visibility: null, description: null, moduleGoal: null, coreTopics: null, authorNotes: null },
    ];
    const lessons: LessonForHierarchy[] = [
      { id: "lesson-2", moduleId: "module-1", title: "Lesson 2", slug: "lesson-2", orderIndex: 2 },
      { id: "lesson-1", moduleId: "module-1", title: "Lesson 1", slug: "lesson-1", orderIndex: 1 },
      { id: "lesson-3", moduleId: "module-1", title: "Lesson 3", slug: "lesson-3", orderIndex: 3 },
    ];
    const groups: GroupMinimal[] = [];
    const slides: SlideForHierarchy[] = [];

    const result = buildCmsHierarchy(modules, lessons, groups, slides);

    const moduleLessons = result.lessonsByModule.get("module-1");
    expect(moduleLessons).toHaveLength(3);
    expect(moduleLessons?.map(l => l.id)).toEqual(["lesson-1", "lesson-2", "lesson-3"]);
  });

  it("groups groups by lesson_id and sorts by order_index", () => {
    const modules: Module[] = [];
    const lessons: LessonForHierarchy[] = [
      { id: "lesson-1", moduleId: "module-1", title: "Lesson 1", slug: "lesson-1", orderIndex: 1 },
    ];
    const groups: GroupMinimal[] = [
      { id: "group-2", lessonId: "lesson-1", title: "Group 2", orderIndex: 2 },
      { id: "group-1", lessonId: "lesson-1", title: "Group 1", orderIndex: 1 },
      { id: "group-3", lessonId: "lesson-1", title: "Group 3", orderIndex: 3 },
    ];
    const slides: SlideForHierarchy[] = [];

    const result = buildCmsHierarchy(modules, lessons, groups, slides);

    const lessonGroups = result.groupsByLesson.get("lesson-1");
    expect(lessonGroups).toHaveLength(3);
    expect(lessonGroups?.map(g => g.id)).toEqual(["group-1", "group-2", "group-3"]);
  });
});

