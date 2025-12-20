import { z } from "zod";

/**
 * Module status enum
 */
export const ModuleStatus = z.enum(["draft", "published", "archived"]);

/**
 * Module visibility enum
 */
export const ModuleVisibility = z.enum(["private", "beta", "public"]);

/**
 * Schema for creating a new module
 * Matches the current form fields and validation rules
 */
export const createModuleSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z.string().trim().min(1, "Slug is required."),
  level: z.string().trim().min(1, "Level is required."),
  order_index: z.number().int().positive(),
  description: z.string().trim().nullable().optional(),
  status: ModuleStatus.optional().nullable(),
  visibility: ModuleVisibility.optional().nullable(),
  module_goal: z.string().trim().nullable().optional(),
  core_topics: z.string().trim().nullable().optional(),
  author_notes: z.string().trim().nullable().optional(),
});

/**
 * Schema for updating a module
 * All fields are optional
 */
export const updateModuleSchema = createModuleSchema.partial();

/**
 * Input schema variant for data layer (snake_case fields)
 * Converts empty strings to null for optional fields
 */
export const moduleInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  level: z.string().trim().nullable(),
  order_index: z.number().int().nullable(),
  description: z.string().trim().nullable(),
  status: ModuleStatus.nullable(),
  visibility: ModuleVisibility.nullable(),
  module_goal: z.string().trim().nullable(),
  core_topics: z.string().trim().nullable(),
  author_notes: z.string().trim().nullable(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type ModuleInput = z.infer<typeof moduleInputSchema>;

