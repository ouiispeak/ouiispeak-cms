# Tier 1, 2, 3 Implementation Roadmap

**Approach:** Micro-step implementation with testing at each stage  
**Status:** Tier 1.2 Complete ✅ | Ready to proceed with remaining tiers

---

## ✅ Completed

### Tier 1.2: Environment Variable Validation
- ✅ Centralized `env.ts` with validated getters
- ✅ Lazy initialization in `supabase.ts`
- ✅ Works in browser and server
- ✅ Fail-fast with helpful error messages

---

## 📋 Remaining Implementation Plan

### Tier 1.1: Database Indexes (SQL Migration)
**Risk:** LOW - Database-only, doesn't affect code  
**Approach:** 
1. Review migration file
2. Test on development database
3. Verify indexes created
4. Test query performance

**Files:**
- `docs/migrations/002_add_performance_indexes.sql`

---

### Tier 2.1: Dashboard Pagination + Lazy Loading
**Risk:** MEDIUM - Changes data loading patterns  
**Approach:** Micro-steps
1. Create paginated data functions (test separately)
2. Create paginated hook (test separately)
3. Test pagination works
4. Update UI to use paginated hook (test incrementally)

**Files:**
- `lib/data/dashboardPaginated.ts`
- `lib/hooks/cms/useCmsDashboardPaginated.ts`

---

### Tier 2.2: Transaction Wrapper
**Risk:** MEDIUM - Changes deletion logic  
**Approach:** Micro-steps
1. Create transaction utilities (test separately)
2. Add RPC functions to database (test separately)
3. Update one deletion function (test)
4. Update other deletion functions (test each)

**Files:**
- `docs/migrations/003_add_transaction_functions.sql`
- `lib/utils/transactions.ts`

---

### Tier 3.1: API Layer with Caching
**Risk:** MEDIUM - Adds new API endpoints  
**Approach:** Micro-steps
1. Create data access interface (test separately)
2. Create Supabase implementation (test separately)
3. Create one API endpoint (test)
4. Add caching (test)
5. Create other endpoints (test each)

**Files:**
- `lib/data/interfaces.ts`
- `lib/data/supabaseDataAccess.ts`
- `app/api/v1/lessons/[lessonId]/route.ts`
- `app/api/v1/lessons/[lessonId]/slides/route.ts`
- `app/api/v1/lessons/[lessonId]/groups/route.ts`

---

### Tier 3.2: Runtime Validation for props_json
**Risk:** LOW - Adds validation, doesn't change behavior  
**Approach:** Micro-steps
1. Create validation utilities (test separately)
2. Add validation to slide loading (test)
3. Test validation works

**Files:**
- `lib/utils/validateSlideProps.ts`

---

## Recommended Order

1. **Tier 1.1** (Database Indexes) - Safest, database-only
2. **Tier 2.1** (Dashboard Pagination) - Improves performance
3. **Tier 2.2** (Transactions) - Improves data integrity
4. **Tier 3.2** (Runtime Validation) - Adds safety
5. **Tier 3.1** (API Layer) - Last, as it depends on other tiers

---

## Success Criteria

- Each tier tested before moving to next
- Browser and server tests pass
- Main application works after each tier
- Can rollback if issues occur

