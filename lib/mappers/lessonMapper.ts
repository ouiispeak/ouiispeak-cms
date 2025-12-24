import type { LessonData, LessonDataMinimal } from "../data/lessons";
import type { Lesson, LessonMinimal } from "../domain/lesson";

/**
 * Convert database row to domain model
 */
export function toLesson(row: LessonData): Lesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    label: row.label,
    title: row.title,
    slug: row.slug,
    orderIndex: row.order_index,
    estimatedMinutes: row.estimated_minutes,
    requiredScore: row.required_score,
    content: row.content,
    shortSummaryAdmin: row.short_summary_admin,
    shortSummaryStudent: row.short_summary_student,
    courseOrganizationGroup: row.course_organization_group,
    slideContents: row.slide_contents,
    groupingStrategySummary: row.grouping_strategy_summary,
    activityTypes: row.activity_types,
    activityDescription: row.activity_description,
    signatureMetaphors: row.signature_metaphors,
    mainGrammarTopics: row.main_grammar_topics,
    pronunciationFocus: row.pronunciation_focus,
    vocabularyTheme: row.vocabulary_theme,
    l1L2Issues: row.l1_l2_issues,
    prerequisites: row.prerequisites,
    learningObjectives: row.learning_objectives,
    notesForTeacherOrAI: row.notes_for_teacher_or_ai,
  };
}

/**
 * Convert minimal database row to minimal domain model
 */
export function toLessonMinimal(row: LessonDataMinimal): LessonMinimal {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    title: row.title ?? "",
  };
}

/**
 * Convert domain model to database row update shape
 */
export function toLessonRowUpdate(input: Partial<Lesson>): Partial<LessonData> {
  const update: Partial<LessonData> = {};

  if (input.moduleId !== undefined) update.module_id = input.moduleId;
  if (input.label !== undefined) update.label = input.label;
  if (input.title !== undefined) update.title = input.title;
  if (input.slug !== undefined) update.slug = input.slug;
  if (input.orderIndex !== undefined) update.order_index = input.orderIndex;
  if (input.estimatedMinutes !== undefined) update.estimated_minutes = input.estimatedMinutes;
  if (input.requiredScore !== undefined) update.required_score = input.requiredScore;
  if (input.content !== undefined) update.content = input.content;
  if (input.shortSummaryAdmin !== undefined) update.short_summary_admin = input.shortSummaryAdmin;
  if (input.shortSummaryStudent !== undefined) update.short_summary_student = input.shortSummaryStudent;
  if (input.courseOrganizationGroup !== undefined) update.course_organization_group = input.courseOrganizationGroup;
  if (input.slideContents !== undefined) update.slide_contents = input.slideContents;
  if (input.groupingStrategySummary !== undefined) update.grouping_strategy_summary = input.groupingStrategySummary;
  if (input.activityTypes !== undefined) update.activity_types = input.activityTypes;
  if (input.activityDescription !== undefined) update.activity_description = input.activityDescription;
  if (input.signatureMetaphors !== undefined) update.signature_metaphors = input.signatureMetaphors;
  if (input.mainGrammarTopics !== undefined) update.main_grammar_topics = input.mainGrammarTopics;
  if (input.pronunciationFocus !== undefined) update.pronunciation_focus = input.pronunciationFocus;
  if (input.vocabularyTheme !== undefined) update.vocabulary_theme = input.vocabularyTheme;
  if (input.l1L2Issues !== undefined) update.l1_l2_issues = input.l1L2Issues;
  if (input.prerequisites !== undefined) update.prerequisites = input.prerequisites;
  if (input.learningObjectives !== undefined) update.learning_objectives = input.learningObjectives;
  if (input.notesForTeacherOrAI !== undefined) update.notes_for_teacher_or_ai = input.notesForTeacherOrAI;

  return update;
}

