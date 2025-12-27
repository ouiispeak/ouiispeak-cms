-- Migration: Add Performance Indexes
-- Description: Creates indexes to optimize common query patterns in the CMS
-- Date: December 2024
-- Tier: 1.1

-- ============================================================================
-- FOREIGN KEY INDEXES
-- ============================================================================
-- These indexes speed up JOINs and foreign key lookups

-- Slides table foreign keys
CREATE INDEX IF NOT EXISTS idx_slides_lesson_id ON public.slides(lesson_id);
CREATE INDEX IF NOT EXISTS idx_slides_group_id ON public.slides(group_id);

-- Lessons table foreign keys
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

-- Groups table foreign keys
CREATE INDEX IF NOT EXISTS idx_groups_lesson_id ON public.lesson_groups(lesson_id);

-- ============================================================================
-- COMPOSITE INDEXES FOR ORDERING
-- ============================================================================
-- These indexes optimize queries that filter by parent and order by order_index
-- Pattern: WHERE parent_id = X ORDER BY order_index

-- Slides: Filter by lesson, order by order_index
CREATE INDEX IF NOT EXISTS idx_slides_lesson_order ON public.slides(lesson_id, order_index);

-- Slides: Filter by group, order by order_index
CREATE INDEX IF NOT EXISTS idx_slides_group_order ON public.slides(group_id, order_index);

-- Lessons: Filter by module, order by order_index
CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON public.lessons(module_id, order_index);

-- Groups: Filter by lesson, order by order_index
CREATE INDEX IF NOT EXISTS idx_groups_lesson_order ON public.lesson_groups(lesson_id, order_index);

-- Modules: Order by order_index (no filter, but still needs index for sorting)
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON public.modules(order_index);

-- ============================================================================
-- ADDITIONAL USEFUL INDEXES
-- ============================================================================

-- Slides: Filter by type (common in slide type queries)
CREATE INDEX IF NOT EXISTS idx_slides_type ON public.slides(type);

-- Slides: Filter by activity status (if filtering by is_activity)
CREATE INDEX IF NOT EXISTS idx_slides_is_activity ON public.slides(is_activity) WHERE is_activity = true;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after migration to verify indexes were created:

-- Check all indexes on slides table
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'slides';

-- Check all indexes on lessons table
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'lessons';

-- Check all indexes on lesson_groups table
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'lesson_groups';

-- Check all indexes on modules table
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'modules';

-- ============================================================================
-- PERFORMANCE TESTING
-- ============================================================================
-- After creating indexes, test query performance:

-- Example: Test slides query (should use idx_slides_lesson_order)
-- EXPLAIN ANALYZE SELECT * FROM slides WHERE lesson_id = 'some-uuid' ORDER BY order_index;

-- Example: Test lessons query (should use idx_lessons_module_order)
-- EXPLAIN ANALYZE SELECT * FROM lessons WHERE module_id = 'some-uuid' ORDER BY order_index;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- DROP INDEX IF EXISTS idx_slides_lesson_id;
-- DROP INDEX IF EXISTS idx_slides_group_id;
-- DROP INDEX IF EXISTS idx_lessons_module_id;
-- DROP INDEX IF EXISTS idx_groups_lesson_id;
-- DROP INDEX IF EXISTS idx_slides_lesson_order;
-- DROP INDEX IF EXISTS idx_slides_group_order;
-- DROP INDEX IF EXISTS idx_lessons_module_order;
-- DROP INDEX IF EXISTS idx_groups_lesson_order;
-- DROP INDEX IF EXISTS idx_modules_order_index;
-- DROP INDEX IF EXISTS idx_slides_type;
-- DROP INDEX IF EXISTS idx_slides_is_activity;

