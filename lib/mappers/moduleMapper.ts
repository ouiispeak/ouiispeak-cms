import type { ModuleData } from "../data/modules";
import type { Module } from "../domain/module";
import { createMapper, withDefault } from "../utils/mapper";

/**
 * Mapper for Module domain model
 */
const moduleMapper = createMapper<Module, ModuleData>({
  fieldMappings: {
    id: "id",
    slug: "slug",
    label: "label",
    title: withDefault("title", ""),
    level: "level",
    orderIndex: "order_index",
    status: "status",
    visibility: "visibility",
    description: "description",
    moduleGoal: "module_goal",
    coreTopics: "core_topics",
    authorNotes: "author_notes",
  },
});

/**
 * Convert database row to domain model
 */
export function toModule(row: ModuleData): Module {
  return moduleMapper.toDomain(row);
}

/**
 * Convert domain model to database row update shape
 */
export function toModuleRowUpdate(input: Partial<Module>): Partial<ModuleData> {
  return moduleMapper.toRowUpdate(input);
}

