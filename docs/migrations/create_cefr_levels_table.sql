-- Migration: Create cefr_levels table
-- Date: 2024
-- Description: Creates a table to store metadata for CEFR levels (A0, A1, A2, B1, B2, C1, C2)

CREATE TABLE IF NOT EXISTS public.cefr_levels (
  level TEXT PRIMARY KEY,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')),
  visibility TEXT CHECK (visibility IN ('private', 'beta', 'public')),
  description TEXT,
  author_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cefr_levels_level ON public.cefr_levels(level);

-- Add comment
COMMENT ON TABLE public.cefr_levels IS 'Metadata for CEFR levels (A0, A1, A2, B1, B2, C1, C2)';

