import { supabase } from "./supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "./realSlideSchema";

export type LoadedLesson = {
  lesson: {
    id: string;
    slug: string;
    title: string;
  };
  groups: {
    id: string;
    title: string;
    order_index: number;
    slides: RealAiSpeakRepeatSlide[];
  }[];
};

export async function loadLessonById(
  lessonId: string
): Promise<LoadedLesson> {
   // 1) lesson (accept uuid OR slug)
   const isUuid =
   /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
     lessonId
   );

 const lessonQuery = supabase.from("lessons").select("id, slug, title");

 const { data: lesson, error: lessonError } = isUuid
   ? await lessonQuery.eq("id", lessonId).maybeSingle()
   : await lessonQuery.eq("slug", lessonId).maybeSingle();

 if (lessonError || !lesson) {
   throw new Error("Lesson not found");
 }

  // 2) groups
  const { data: groups, error: groupsError } = await supabase
    .from("lesson_groups")
    .select("id, title, order_index")
    .eq("lesson_id", lesson.id)
    .order("order_index");

  if (groupsError) {
    throw new Error(groupsError.message);
  }

  // 3) slides
  const { data: slides, error: slidesError } = await supabase
    .from("slides")
    .select("id, group_id, order_index, type, props_json, aid_hook")
    .eq("lesson_id", lesson.id)
    .order("order_index");

  if (slidesError) {
    throw new Error(slidesError.message);
  }

  // 4) assemble
  const grouped = (groups ?? []).map((group) => {
    const groupSlides: RealAiSpeakRepeatSlide[] = [];

    (slides ?? [])
      .filter((s) => s.group_id === group.id)
      .forEach((row) => {
        if (row.type === "ai-speak-repeat") {
          const parsed = aiSpeakRepeatSlideSchema.safeParse({
            id: row.id,
            groupId: row.group_id,
            type: row.type,
            props: row.props_json,
            aidHook: row.aid_hook,
          });

          if (parsed.success) {
            groupSlides.push(parsed.data);
          }
        }
      });

    return {
      id: group.id,
      title: group.title,
      order_index: group.order_index,
      slides: groupSlides,
    };
  });

  return {
    lesson,
    groups: grouped,
  };
}
