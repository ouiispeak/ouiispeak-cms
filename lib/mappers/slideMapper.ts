import type { SlideData, SlideDataMinimal } from "../data/slides";
import type { Slide, SlideMinimal } from "../domain/slide";

/**
 * Convert database row to domain model
 */
export function toSlide(row: SlideData): Slide {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    groupId: row.group_id,
    orderIndex: row.order_index,
    type: row.type,
    propsJson: row.props_json,
    aidHook: row.aid_hook,
    code: row.code,
    metaJson: row.meta_json,
    isActivity: row.is_activity,
    scoreType: row.score_type,
    passingScoreValue: row.passing_score_value,
    maxScoreValue: row.max_score_value,
    passRequiredForNext: row.pass_required_for_next,
  };
}

/**
 * Convert minimal database row to minimal domain model
 */
export function toSlideMinimal(row: SlideDataMinimal): SlideMinimal {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    groupId: row.group_id,
    orderIndex: row.order_index,
    type: row.type,
  };
}

/**
 * Convert domain model to database row update shape
 */
export function toSlideRowUpdate(input: Partial<Slide>): Partial<SlideData> {
  const update: Partial<SlideData> = {};

  if (input.lessonId !== undefined) update.lesson_id = input.lessonId;
  if (input.groupId !== undefined) update.group_id = input.groupId;
  if (input.orderIndex !== undefined) update.order_index = input.orderIndex;
  if (input.type !== undefined) update.type = input.type;
  if (input.propsJson !== undefined) update.props_json = input.propsJson;
  if (input.aidHook !== undefined) update.aid_hook = input.aidHook;
  if (input.code !== undefined) update.code = input.code;
  if (input.metaJson !== undefined) update.meta_json = input.metaJson;
  if (input.isActivity !== undefined) update.is_activity = input.isActivity;
  if (input.scoreType !== undefined) update.score_type = input.scoreType;
  if (input.passingScoreValue !== undefined) update.passing_score_value = input.passingScoreValue;
  if (input.maxScoreValue !== undefined) update.max_score_value = input.maxScoreValue;
  if (input.passRequiredForNext !== undefined) update.pass_required_for_next = input.passRequiredForNext;

  return update;
}

