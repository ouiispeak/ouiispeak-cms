import type { Slide } from "../domain/slide";
import type { Group } from "../domain/group";
import type { Lesson } from "../domain/lesson";
import type { Module } from "../domain/module";

/**
 * Gets the display name for a slide, used in CMS navigation, breadcrumbs, and listings.
 * Uses label first, then falls back to title if label is missing.
 * 
 * IMPORTANT: This is for CMS/internal use only. Never use this in player/learner-facing components.
 */
export function getSlideDisplayName(slide: Slide | { propsJson?: unknown }): string {
  // Extract props from propsJson with proper type checking
  const propsJson = "propsJson" in slide ? slide.propsJson : (slide as Slide).propsJson;
  
  // Check if propsJson is an object with label/title properties
  if (propsJson && typeof propsJson === "object" && !Array.isArray(propsJson)) {
    const props = propsJson as Record<string, unknown>;
    
    // Try label first
    const label = typeof props.label === "string" ? props.label.trim() : "";
    if (label) {
      return label;
    }
    
    // Fall back to title if label is missing
    const title = typeof props.title === "string" ? props.title.trim() : "";
    if (title) {
      return title;
    }
  }
  
  // Final fallback
  return "Untitled slide";
}

/**
 * Gets the display name for a group, used in CMS navigation, breadcrumbs, and listings.
 * Uses label ONLY, falling back to "Untitled group" if label is missing.
 * 
 * IMPORTANT: This function does NOT fall back to title or slug - it uses label only.
 *
 * IMPORTANT: This is for CMS/internal use only. Never use this in player/learner-facing components.
 */
export function getGroupDisplayName(group: Group | { label: string | null; title?: string | null }): string {
  // Use label ONLY - no fallback to title or slug
  const label = group.label?.trim();
  
  // Return label if it exists and is non-empty, otherwise "Untitled group"
  return label || "Untitled group";
}

/**
 * Gets the display name for a lesson, used in CMS navigation, breadcrumbs, and listings.
 * Uses label ONLY, falling back to "Untitled lesson" if label is missing.
 * 
 * IMPORTANT: This function does NOT fall back to title or slug - it uses label only.
 *
 * IMPORTANT: This is for CMS/internal use only. Never use this in player/learner-facing components.
 */
export function getLessonDisplayName(lesson: Lesson | { label: string | null; title?: string | null }): string {
  // Use label ONLY - no fallback to title or slug
  const label = lesson.label?.trim();
  
  // Return label if it exists and is non-empty, otherwise "Untitled lesson"
  return label || "Untitled lesson";
}

/**
 * Gets the display name for a module, used in CMS navigation, breadcrumbs, and listings.
 * Uses label ONLY, falling back to "Untitled module" if label is missing.
 * 
 * IMPORTANT: This function does NOT fall back to title or slug - it uses label only.
 *
 * IMPORTANT: This is for CMS/internal use only. Never use this in player/learner-facing components.
 */
export function getModuleDisplayName(module: Module | { label: string | null; title?: string | null; slug?: string | null }): string {
  // Use label ONLY - no fallback to title or slug
  const label = module.label?.trim();
  
  // Return label if it exists and is non-empty, otherwise "Untitled module"
  return label || "Untitled module";
}

