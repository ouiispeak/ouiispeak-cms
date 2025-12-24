import { z } from "zod";

/**
 * CEFR Level status enum (matches ModuleStatus)
 */
export const CefrLevelStatus = z.enum(["draft", "published", "archived"]);

/**
 * CEFR Level visibility enum (matches ModuleVisibility)
 */
export const CefrLevelVisibility = z.enum(["private", "beta", "public"]);

/**
 * Schema for creating/updating a CEFR level
 */
export const cefrLevelSchema = z.object({
  level: z.string().trim().min(1, "Level is required."),
  status: CefrLevelStatus.nullable().optional(),
  visibility: CefrLevelVisibility.nullable().optional(),
  description: z.string().trim().nullable().optional(),
  author_notes: z.string().trim().nullable().optional(),
});

/**
 * Schema for updating a CEFR level (all fields optional)
 */
export const updateCefrLevelSchema = cefrLevelSchema.partial().extend({
  level: z.string().trim().min(1).optional(), // Level can be optional in updates
});

/**
 * Input schema variant for data layer (snake_case fields)
 */
export const cefrLevelInputSchema = z.object({
  level: z.string().trim().min(1),
  status: CefrLevelStatus.nullable(),
  visibility: CefrLevelVisibility.nullable(),
  description: z.string().trim().nullable(),
  author_notes: z.string().trim().nullable(),
});

export type CreateCefrLevelInput = z.infer<typeof cefrLevelSchema>;
export type UpdateCefrLevelInput = z.infer<typeof updateCefrLevelSchema>;
export type CefrLevelInput = z.infer<typeof cefrLevelInputSchema>;

