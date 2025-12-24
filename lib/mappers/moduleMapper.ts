import type { ModuleData } from "../data/modules";
import type { Module } from "../domain/module";
import type { ModuleRow } from "../types/db";

/**
 * Convert database row to domain model
 */
export function toModule(row: ModuleData): Module {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    title: row.title ?? "",
    level: row.level,
    orderIndex: row.order_index,
    status: row.status,
    visibility: row.visibility,
    description: row.description,
    moduleGoal: row.module_goal,
    coreTopics: row.core_topics,
    authorNotes: row.author_notes,
  };
}

/**
 * Convert domain model to database row update shape
 */
export function toModuleRowUpdate(input: Partial<Module>): Partial<ModuleData> {
  const update: Partial<ModuleData> = {};

  if (input.label !== undefined) update.label = input.label;
  if (input.title !== undefined) update.title = input.title;
  if (input.slug !== undefined) update.slug = input.slug;
  if (input.level !== undefined) update.level = input.level;
  if (input.orderIndex !== undefined) update.order_index = input.orderIndex;
  if (input.status !== undefined) update.status = input.status;
  if (input.visibility !== undefined) update.visibility = input.visibility;
  if (input.description !== undefined) update.description = input.description;
  if (input.moduleGoal !== undefined) update.module_goal = input.moduleGoal;
  if (input.coreTopics !== undefined) update.core_topics = input.coreTopics;
  if (input.authorNotes !== undefined) update.author_notes = input.authorNotes;

  return update;
}

