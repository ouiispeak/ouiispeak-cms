import type { SlideData, SlideDataMinimal } from "../data/slides";
import type { Slide, SlideMinimal } from "../domain/slide";
import { createMapper } from "../utils/mapper";

/**
 * Mapper for full Slide domain model
 */
const slideMapper = createMapper<Slide, SlideData>({
  fieldMappings: {
    id: "id",
    lessonId: "lesson_id",
    groupId: "group_id",
    orderIndex: "order_index",
    type: "type",
    propsJson: "props_json",
    aidHook: "aid_hook",
    code: "code",
    metaJson: "meta_json",
    isActivity: "is_activity",
    scoreType: "score_type",
    passingScoreValue: "passing_score_value",
    maxScoreValue: "max_score_value",
    passRequiredForNext: "pass_required_for_next",
  },
});

/**
 * Mapper for minimal Slide domain model
 */
const slideMinimalMapper = createMapper<SlideMinimal, SlideDataMinimal>({
  fieldMappings: {
    id: "id",
    lessonId: "lesson_id",
    groupId: "group_id",
    orderIndex: "order_index",
    type: "type",
  },
});

/**
 * Convert database row to domain model
 */
export function toSlide(row: SlideData): Slide {
  return slideMapper.toDomain(row);
}

/**
 * Convert minimal database row to minimal domain model
 */
export function toSlideMinimal(row: SlideDataMinimal): SlideMinimal {
  return slideMinimalMapper.toDomain(row);
}

/**
 * Convert domain model to database row update shape
 */
export function toSlideRowUpdate(input: Partial<Slide>): Partial<SlideData> {
  return slideMapper.toRowUpdate(input);
}

