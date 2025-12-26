-- Migration: Create slide configuration tables
-- Date: 2024
-- Description: Creates tables for slide type configurations and field registry to support dynamic form rendering
-- Part of: Slide Form System Refactor (see docs/REFACTOR_SLIDE_FORM_SYSTEM.md)

-- Step 1.1: Create field registry table
-- This table stores all possible form fields that can be used in slide forms
CREATE TABLE IF NOT EXISTS public.slide_field_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id TEXT UNIQUE NOT NULL,  -- e.g., "label", "title", "phrases"
  display_name TEXT NOT NULL,
  field_type TEXT NOT NULL,  -- "text", "textarea", "select", "checkbox", "number", "audio", "complex"
  component_name TEXT,  -- Custom component if needed (e.g., "StudentRepeatElementMapper")
  default_value JSONB,
  validation_schema JSONB,  -- Validation rules (Zod schema or custom rules)
  info_tooltip TEXT,
  section_id TEXT,  -- Default section this field belongs to
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 1.2: Create slide type configs table
-- This table stores the form configuration for each slide type (the source of truth)
CREATE TABLE IF NOT EXISTS public.slide_type_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_key TEXT UNIQUE NOT NULL,  -- e.g., "ai-speak-student-repeat"
  display_name TEXT NOT NULL,  -- e.g., "AI Speak Student Repeat"
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  form_config JSONB NOT NULL,  -- Complete form structure (sections, fields, validation rules)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 1.3: Add config tracking columns to slides table
-- These columns track which config version a slide uses (for migration safety)
ALTER TABLE public.slides ADD COLUMN IF NOT EXISTS config_version INTEGER;
ALTER TABLE public.slides ADD COLUMN IF NOT EXISTS config_snapshot JSONB;  -- Optional: snapshot of config at slide creation

-- Step 1.4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_slide_type_configs_type_key ON public.slide_type_configs(type_key);
CREATE INDEX IF NOT EXISTS idx_slide_type_configs_active ON public.slide_type_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_slide_field_registry_field_id ON public.slide_field_registry(field_id);
CREATE INDEX IF NOT EXISTS idx_slides_config_version ON public.slides(config_version);

-- Step 1.5: Add comments for documentation
COMMENT ON TABLE public.slide_field_registry IS 'Registry of all available form fields for slide editing. Defines field metadata, validation, and UI components.';
COMMENT ON TABLE public.slide_type_configs IS 'Configuration for each slide type defining which fields appear, their order, sections, and validation rules. This is the source of truth for form rendering.';
COMMENT ON COLUMN public.slides.config_version IS 'Tracks which version of slide_type_configs was used when this slide was created/updated.';
COMMENT ON COLUMN public.slides.config_snapshot IS 'Optional snapshot of the form_config at the time this slide was created, for historical reference.';

-- Verification query (run after migration to confirm tables exist)
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('slide_field_registry', 'slide_type_configs');

