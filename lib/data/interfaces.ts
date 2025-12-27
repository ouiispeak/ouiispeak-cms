/**
 * Tier 3.1 Step 1: Data Access Interface
 * 
 * Abstract interface for data access operations.
 * Allows swapping implementations (Supabase, mock, etc.) without changing API code.
 */

import type { Lesson } from "../domain/lesson";
import type { Slide } from "../domain/slide";
import type { GroupMinimal } from "../domain/group";

/**
 * Result type for data operations
 */
export type DataResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Data Access Interface
 * 
 * Defines the contract for accessing lesson, slide, and group data.
 * Implementations can use Supabase, mock data, or other data sources.
 */
export interface IDataAccess {
  /**
   * Get a lesson by ID
   * 
   * @param lessonId - The lesson ID
   * @returns Promise resolving to lesson data or error
   */
  getLessonById(lessonId: string): Promise<DataResult<Lesson>>;

  /**
   * Get all slides for a lesson
   * 
   * @param lessonId - The lesson ID
   * @returns Promise resolving to array of slides or error
   */
  getSlidesByLessonId(lessonId: string): Promise<DataResult<Slide[]>>;

  /**
   * Get all groups for a lesson
   * 
   * @param lessonId - The lesson ID
   * @returns Promise resolving to array of groups or error
   */
  getGroupsByLessonId(lessonId: string): Promise<DataResult<GroupMinimal[]>>;
}

