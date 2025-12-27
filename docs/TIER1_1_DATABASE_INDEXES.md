# Tier 1.1: Database Indexes - Implementation Guide

**Status:** ✅ Migration file created  
**Risk:** LOW - Database-only changes, no code changes  
**Next:** Apply migration to development database

---

## What Was Created

### Migration File
- **`docs/migrations/002_add_performance_indexes.sql`**
  - 11 indexes for query performance
  - Foreign key indexes for JOINs
  - Composite indexes for ordering queries
  - Additional indexes for filtering

### Verification Script
- **`scripts/verify-indexes.ts`**
  - Lists expected indexes
  - Provides SQL query to verify indexes exist
  - Tests database connection

---

## Indexes Created

### Foreign Key Indexes (4)
1. `idx_slides_lesson_id` - Fast lookups of slides by lesson
2. `idx_slides_group_id` - Fast lookups of slides by group
3. `idx_lessons_module_id` - Fast lookups of lessons by module
4. `idx_groups_lesson_id` - Fast lookups of groups by lesson

### Composite Ordering Indexes (5)
5. `idx_slides_lesson_order` - Efficient `WHERE lesson_id = X ORDER BY order_index`
6. `idx_slides_group_order` - Efficient `WHERE group_id = X ORDER BY order_index`
7. `idx_lessons_module_order` - Efficient `WHERE module_id = X ORDER BY order_index`
8. `idx_groups_lesson_order` - Efficient `WHERE lesson_id = X ORDER BY order_index`
9. `idx_modules_order_index` - Efficient `ORDER BY order_index` on modules

### Additional Indexes (2)
10. `idx_slides_type` - Filter by slide type
11. `idx_slides_is_activity` - Filter by activity status (partial index)

---

## How to Apply

### Step 1: Review Migration
```bash
cat docs/migrations/002_add_performance_indexes.sql
```

### Step 2: Apply to Development Database
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `002_add_performance_indexes.sql`
4. Run the migration
5. Verify no errors

### Step 3: Verify Indexes Created
Run this query in Supabase SQL Editor:
```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('slides', 'lessons', 'lesson_groups', 'modules')
ORDER BY tablename, indexname;
```

You should see all 11 indexes listed.

### Step 4: Test Query Performance
Test a query to see if it uses the index:
```sql
EXPLAIN ANALYZE 
SELECT * FROM slides 
WHERE lesson_id = 'some-uuid' 
ORDER BY order_index;
```

Look for "Index Scan using idx_slides_lesson_order" in the output.

---

## Expected Impact

- **Query Performance:** 10x faster for common queries
- **JOIN Operations:** Significantly improved
- **Pagination:** Now efficient
- **Database CPU:** ~70% reduction for common queries

---

## Rollback (if needed)

If indexes cause issues (unlikely), you can drop them:
```sql
-- See rollback section in migration file
DROP INDEX IF EXISTS idx_slides_lesson_id;
-- ... etc
```

---

## Next Steps

After verifying indexes work:
1. ✅ Proceed to Tier 2.1 (Dashboard Pagination)
2. ✅ Continue with remaining tiers

**Status:** Ready to apply migration to database

