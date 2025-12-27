# Database Migration Guide

This guide walks you through applying the two database migrations required for the Tier implementations.

---

## Migration 1: Performance Indexes

**File:** `docs/migrations/002_add_performance_indexes.sql`  
**Purpose:** Creates database indexes to speed up common queries  
**Risk:** LOW - Read-only operation, safe to apply  
**Impact:** Improves query performance, especially for dashboard loading

### What This Migration Does

Creates 11 indexes across 4 tables:

1. **Foreign Key Indexes** (4 indexes)
   - Speeds up JOINs and foreign key lookups
   - `idx_slides_lesson_id`, `idx_slides_group_id`
   - `idx_lessons_module_id`, `idx_groups_lesson_id`

2. **Composite Ordering Indexes** (5 indexes)
   - Optimizes queries that filter by parent and order by `order_index`
   - Pattern: `WHERE parent_id = X ORDER BY order_index`
   - Examples: `idx_slides_lesson_order`, `idx_lessons_module_order`

3. **Additional Indexes** (2 indexes)
   - `idx_slides_type` - For filtering by slide type
   - `idx_slides_is_activity` - For filtering by activity status

### Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy Migration SQL**
   - Open `docs/migrations/002_add_performance_indexes.sql` in your editor
   - Copy the entire file contents (all 95 lines)

4. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for execution to complete

5. **Verify Success**
   - You should see "Success. No rows returned" (indexes don't return data)
   - If you see errors, check the error message

6. **Verify Indexes Were Created** (Optional)
   - Run this query in SQL Editor:
   ```sql
   SELECT 
     tablename,
     indexname,
     indexdef
   FROM pg_indexes
   WHERE schemaname = 'public'
     AND tablename IN ('slides', 'lessons', 'lesson_groups', 'modules')
     AND indexname LIKE 'idx_%'
   ORDER BY tablename, indexname;
   ```
   - You should see all 11 indexes listed

### Expected Results

- ✅ All 11 indexes created successfully
- ✅ No errors in execution
- ✅ Query performance improves (especially dashboard loading)

### Rollback (if needed)

If you need to remove the indexes, run:
```sql
DROP INDEX IF EXISTS idx_slides_lesson_id;
DROP INDEX IF EXISTS idx_slides_group_id;
DROP INDEX IF EXISTS idx_lessons_module_id;
DROP INDEX IF EXISTS idx_groups_lesson_id;
DROP INDEX IF EXISTS idx_slides_lesson_order;
DROP INDEX IF EXISTS idx_slides_group_order;
DROP INDEX IF EXISTS idx_lessons_module_order;
DROP INDEX IF EXISTS idx_groups_lesson_order;
DROP INDEX IF EXISTS idx_modules_order_index;
DROP INDEX IF EXISTS idx_slides_type;
DROP INDEX IF EXISTS idx_slides_is_activity;
```

---

## Migration 2: Transaction Functions

**File:** `docs/migrations/003_add_transaction_functions.sql`  
**Purpose:** Creates PostgreSQL functions for atomic deletions  
**Risk:** LOW - Creates functions, doesn't modify data  
**Impact:** Enables atomic transaction-based deletions (all-or-nothing)

### What This Migration Does

Creates 4 PostgreSQL functions that wrap deletion operations in transactions:

1. **`delete_module_transaction(module_id)`**
   - Deletes module + all lessons + all groups + all slides atomically
   - Order: slides → groups → lessons → module

2. **`delete_lesson_transaction(lesson_id)`**
   - Deletes lesson + all groups + all slides atomically
   - Order: slides → groups → lesson

3. **`delete_group_transaction(group_id)`**
   - Deletes group + all slides atomically
   - Order: slides → group

4. **`delete_slide_transaction(slide_id)`**
   - Deletes single slide atomically

**Key Features:**
- All operations happen in a single transaction
- If any step fails, everything rolls back (no partial deletions)
- Uses `SECURITY DEFINER` for proper permissions
- Grants execute permissions to authenticated users

### Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy Migration SQL**
   - Open `docs/migrations/003_add_transaction_functions.sql` in your editor
   - Copy the entire file contents (all 147 lines)

4. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for execution to complete

5. **Verify Success**
   - You should see "Success. No rows returned" (functions don't return data)
   - Check for any error messages

6. **Verify Functions Were Created** (Optional)
   - Run this query in SQL Editor:
   ```sql
   SELECT 
     routine_name,
     routine_type
   FROM information_schema.routines
   WHERE routine_schema = 'public'
     AND routine_name IN (
       'delete_module_transaction',
       'delete_lesson_transaction',
       'delete_group_transaction',
       'delete_slide_transaction'
     )
   ORDER BY routine_name;
   ```
   - You should see all 4 functions listed

### Expected Results

- ✅ All 4 functions created successfully
- ✅ Functions have proper permissions
- ✅ Deletion operations now use transactions (automatic)

### Testing the Functions

After applying the migration, your deletion code will automatically use these functions. To test manually:

```sql
-- Test delete_slide_transaction (use a real slide ID)
-- SELECT delete_slide_transaction('your-slide-id-here');

-- Note: Don't run this unless you want to actually delete something!
```

### Rollback (if needed)

If you need to remove the functions, run:
```sql
DROP FUNCTION IF EXISTS delete_module_transaction(UUID);
DROP FUNCTION IF EXISTS delete_lesson_transaction(UUID);
DROP FUNCTION IF EXISTS delete_group_transaction(UUID);
DROP FUNCTION IF EXISTS delete_slide_transaction(UUID);
```

---

## Quick Reference

### Migration Order

Apply migrations in this order:
1. **First:** Performance Indexes (002)
2. **Second:** Transaction Functions (003)

### Both Migrations Are Safe

- ✅ **Performance Indexes:** Read-only, only creates indexes
- ✅ **Transaction Functions:** Only creates functions, doesn't modify data
- ✅ Both can be applied multiple times safely (uses `IF NOT EXISTS` / `CREATE OR REPLACE`)

### After Applying Migrations

1. **Performance Indexes:**
   - Dashboard loading should be faster
   - Queries will use indexes automatically

2. **Transaction Functions:**
   - Deletion operations will be atomic
   - No more partial deletions if something fails

### Troubleshooting

**If you see permission errors:**
- Make sure you're logged in as the project owner or have admin access
- Check that your Supabase project has the correct permissions

**If indexes already exist:**
- That's fine! The migration uses `IF NOT EXISTS`, so it will skip existing indexes

**If functions already exist:**
- That's fine! The migration uses `CREATE OR REPLACE`, so it will update existing functions

---

## Need Help?

If you encounter any issues:
1. Check the error message in Supabase SQL Editor
2. Verify you're copying the entire migration file
3. Make sure you have proper permissions in Supabase
4. Check that your database tables exist (modules, lessons, lesson_groups, slides)

