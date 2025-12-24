import { z } from "zod";

/**
 * Group type enum
 */
export const GroupType = z.enum(["title", "intro", "practice", "test", "wrap-up", "finale"]);

/**
 * Passing score type enum
 */
export const PassingScoreType = z.enum(["percent", "raw", "none"]);

/**
 * Schema for creating a new group
 * Matches the current form fields and validation rules
 * group_slides_plan can be a JSON string (from form) or array (from parsed data)
 */
export const createGroupSchema = z.object({
  lesson_id: z.string().min(1, "Lesson is required."),
  label: z.string().trim().min(1, "Label is required for CMS navigation."),
  title: z.string().trim().nullable().optional(),
  order_index: z.number().int().positive(),
  group_code: z.string().trim().nullable().optional(),
  short_summary: z.string().trim().nullable().optional(),
  group_type: GroupType.nullable().optional(),
  group_summary: z.string().trim().nullable().optional(),
  group_goal: z.string().trim().nullable().optional(),
  prerequisites: z.string().trim().nullable().optional(),
  is_required_to_pass: z.boolean().nullable().optional(),
  passing_score_type: PassingScoreType.nullable().optional(),
  passing_score_value: z.number().nullable().optional(),
  max_score_value: z.number().nullable().optional(),
  extra_practice_notes: z.string().trim().nullable().optional(),
  l1_l2: z.string().trim().nullable().optional(),
  media_used_ids: z.string().trim().nullable().optional(),
  group_slides_plan: z.union([
    z.string().trim(),
    z.array(z.string())
  ]).nullable().optional().transform((val) => {
    if (!val) return null;
    if (Array.isArray(val)) {
      // Validate it is an array of strings
      if (!val.every((item) => typeof item === "string")) {
        throw new Error("Planned slide sequence must be an array of strings.");
      }
      return val;
    }
    // Parse JSON string
    if (val.trim() === "") return null;
    try {
      const parsed = JSON.parse(val.trim());
      if (!Array.isArray(parsed)) {
        throw new Error("Planned slide sequence must be a JSON array.");
      }
      if (!parsed.every((item) => typeof item === "string")) {
        throw new Error("Planned slide sequence must be an array of strings.");
      }
      return parsed;
    } catch (parseError) {
      throw new Error("Invalid JSON in planned slide sequence. Please check the format.");
    }
  }),
});

/**
 * Schema for updating a group
 * All fields are optional
 */
export const updateGroupSchema = createGroupSchema.partial();

/**
 * Input schema variant for data layer (snake_case fields)
 * Converts empty strings to null for optional fields
 * Handles group_slides_plan as JSON
 */
export const groupInputSchema = z.object({
  lesson_id: z.string(),
  label: z.string().trim().min(1),
  title: z.string().trim().nullable(),
  order_index: z.number().int().nullable(),
  group_code: z.string().trim().nullable(),
  short_summary: z.string().trim().nullable(),
  group_type: GroupType.nullable(),
  group_summary: z.string().trim().nullable(),
  group_goal: z.string().trim().nullable(),
  prerequisites: z.string().trim().nullable(),
  is_required_to_pass: z.boolean().nullable(),
  passing_score_type: PassingScoreType.nullable(),
  passing_score_value: z.number().nullable(),
  max_score_value: z.number().nullable(),
  extra_practice_notes: z.string().trim().nullable(),
  l1_l2: z.string().trim().nullable(),
  media_used_ids: z.string().trim().nullable(),
  group_slides_plan: z.unknown().nullable(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type GroupInput = z.infer<typeof groupInputSchema>;

