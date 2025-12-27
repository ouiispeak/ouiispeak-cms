/**
 * Tier 3.1 Step 2: Supabase Data Access Implementation
 * 
 * Concrete implementation of IDataAccess using Supabase.
 * Wraps existing data functions to provide a clean interface for API endpoints.
 */

import type { IDataAccess, DataResult } from "./interfaces";
import { loadLessonById } from "./lessons";
import { loadSlidesByLesson } from "./slides";
import { loadGroupsByLesson } from "./groups";
import type { Lesson } from "../domain/lesson";
import type { Slide } from "../domain/slide";
import type { GroupMinimal } from "../domain/group";
import { toSlide } from "../mappers/slideMapper";

/**
 * Supabase implementation of IDataAccess
 */
export class SupabaseDataAccess implements IDataAccess {
  /**
   * Get a lesson by ID
   */
  async getLessonById(lessonId: string): Promise<DataResult<Lesson>> {
    const result = await loadLessonById(lessonId);
    return {
      data: result.data,
      error: result.error,
    };
  }

  /**
   * Get all slides for a lesson
   */
  async getSlidesByLessonId(lessonId: string): Promise<DataResult<Slide[]>> {
    const result = await loadSlidesByLesson(lessonId);
    
    if (result.error) {
      return { data: null, error: result.error };
    }

    if (!result.data) {
      return { data: [], error: null };
    }

    // Load full slide data (loadSlidesByLesson returns minimal, we need full for API)
    // For now, we'll need to load full slides. Let me check what we have available.
    // Actually, for the API, we might want full slides. Let me use a different approach.
    // We'll need to load slides with full data including props_json.
    
    // For now, convert minimal to full slides (props_json will be loaded separately if needed)
    // Actually, let's load full slides directly
    const { supabase } = await import("../supabase");
    const SLIDE_FIELDS_FULL = "id, lesson_id, group_id, order_index, type, props_json, aid_hook, code, meta_json, is_activity, score_type, passing_score_value, max_score_value, pass_required_for_next";
    
    const { data: slidesData, error: slidesError } = await supabase
      .from("slides")
      .select(SLIDE_FIELDS_FULL)
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });

    if (slidesError) {
      return { data: null, error: slidesError.message };
    }

    const slides = (slidesData ?? []).map((row) => toSlide({
      id: row.id,
      lesson_id: row.lesson_id,
      group_id: row.group_id,
      order_index: row.order_index,
      type: row.type,
      props_json: row.props_json,
      aid_hook: row.aid_hook,
      code: row.code,
      meta_json: row.meta_json,
      is_activity: row.is_activity,
      score_type: row.score_type,
      passing_score_value: row.passing_score_value,
      max_score_value: row.max_score_value,
      pass_required_for_next: row.pass_required_for_next,
    }));

    return { data: slides, error: null };
  }

  /**
   * Get all groups for a lesson
   */
  async getGroupsByLessonId(lessonId: string): Promise<DataResult<GroupMinimal[]>> {
    const result = await loadGroupsByLesson(lessonId);
    return {
      data: result.data,
      error: result.error,
    };
  }
}

/**
 * Default instance for use in API routes
 */
export const defaultDataAccess = new SupabaseDataAccess();

