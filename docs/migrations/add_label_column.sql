-- Migration: Add label column to modules, lessons, and lesson_groups tables
-- Date: 2024
-- Description: Adds a nullable 'label' column for CMS/internal navigation names
--              This is separate from 'title' which is for learner-facing content

-- Add label column to modules table
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS label text;

-- Add label column to lessons table  
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS label text;

-- Add label column to lesson_groups table
ALTER TABLE lesson_groups
ADD COLUMN IF NOT EXISTS label text;

-- Note: The label column is nullable to maintain backward compatibility
-- with existing data. New records should have label set via application
-- validation, but existing records can have NULL labels temporarily.

