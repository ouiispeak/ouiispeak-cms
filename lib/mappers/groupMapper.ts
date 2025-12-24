import type { GroupData, GroupDataMinimal } from "../data/groups";
import type { Group, GroupMinimal } from "../domain/group";

/**
 * Convert database row to domain model
 */
export function toGroup(row: GroupData): Group {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    label: row.label,
    title: row.title ?? "",
    orderIndex: row.order_index,
    groupCode: row.group_code,
    shortSummary: row.short_summary,
    groupType: row.group_type,
    groupSummary: row.group_summary,
    groupGoal: row.group_goal,
    prerequisites: row.prerequisites,
    isRequiredToPass: row.is_required_to_pass,
    passingScoreType: row.passing_score_type,
    passingScoreValue: row.passing_score_value,
    maxScoreValue: row.max_score_value,
    extraPracticeNotes: row.extra_practice_notes,
    l1L2: row.l1_l2,
    mediaUsedIds: row.media_used_ids,
    groupSlidesPlan: row.group_slides_plan,
  };
}

/**
 * Convert minimal database row to minimal domain model
 */
export function toGroupMinimal(row: GroupDataMinimal): GroupMinimal {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    orderIndex: row.order_index,
    label: row.label,
    title: row.title ?? "",
  };
}

/**
 * Convert domain model to database row update shape
 */
export function toGroupRowUpdate(input: Partial<Group>): Partial<GroupData> {
  const update: Partial<GroupData> = {};

  if (input.lessonId !== undefined) update.lesson_id = input.lessonId;
  if (input.label !== undefined) update.label = input.label;
  if (input.title !== undefined) update.title = input.title;
  if (input.orderIndex !== undefined) update.order_index = input.orderIndex;
  if (input.groupCode !== undefined) update.group_code = input.groupCode;
  if (input.shortSummary !== undefined) update.short_summary = input.shortSummary;
  if (input.groupType !== undefined) update.group_type = input.groupType;
  if (input.groupSummary !== undefined) update.group_summary = input.groupSummary;
  if (input.groupGoal !== undefined) update.group_goal = input.groupGoal;
  if (input.prerequisites !== undefined) update.prerequisites = input.prerequisites;
  if (input.isRequiredToPass !== undefined) update.is_required_to_pass = input.isRequiredToPass;
  if (input.passingScoreType !== undefined) update.passing_score_type = input.passingScoreType;
  if (input.passingScoreValue !== undefined) update.passing_score_value = input.passingScoreValue;
  if (input.maxScoreValue !== undefined) update.max_score_value = input.maxScoreValue;
  if (input.extraPracticeNotes !== undefined) update.extra_practice_notes = input.extraPracticeNotes;
  if (input.l1L2 !== undefined) update.l1_l2 = input.l1L2;
  if (input.mediaUsedIds !== undefined) update.media_used_ids = input.mediaUsedIds;
  if (input.groupSlidesPlan !== undefined) update.group_slides_plan = input.groupSlidesPlan;

  return update;
}

