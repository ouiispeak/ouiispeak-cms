# Slide Ordering Issue

## Problem
Slides are not appearing in the correct order in the lesson player.

## Root Cause
In `loadLessonFromDb.ts` (line 39), slides are ordered ONLY by `order_index`:
```typescript
.order('order_index', { ascending: true });
```

However, slides belong to groups, and groups also have an `order_index`. The `order_index` on slides is scoped **within each group**, not globally across the lesson.

## Current Behavior
If you have:
- **Group 1** (order_index: 0) with slides at order_index: 0, 1, 2
- **Group 2** (order_index: 1) with slides at order_index: 0, 1, 2

The current query orders ALL slides by their `order_index`, resulting in:
1. Group 1 slide 0
2. Group 2 slide 0  ❌ Wrong!
3. Group 1 slide 1
4. Group 2 slide 1  ❌ Wrong!
5. Group 1 slide 2
6. Group 2 slide 2

## Expected Behavior
Slides should be ordered by:
1. **Group order_index** (ascending)
2. **Slide order_index** within each group (ascending)

Result:
1. Group 1 slide 0 ✓
2. Group 1 slide 1 ✓
3. Group 1 slide 2 ✓
4. Group 2 slide 0 ✓
5. Group 2 slide 1 ✓
6. Group 2 slide 2 ✓

## Solution
The `loadLessonFromDb.ts` function needs to:
1. Fetch groups ordered by `order_index`
2. Fetch slides ordered by `group_id` and `order_index` (or join with groups table)
3. Sort slides by group order, then slide order

## Fix Options

### Option 1: Join with groups table (Recommended)
```typescript
const { data: slidesData, error: slidesError } = await supabase
  .from('slides')
  .select(`
    id, 
    group_id, 
    type, 
    props_json, 
    aid_hook, 
    order_index,
    lesson_groups!inner(order_index)
  `)
  .eq('lesson_id', lessonId)
  .order('lesson_groups.order_index', { ascending: true })
  .order('order_index', { ascending: true });
```

### Option 2: Fetch groups first, then sort in JavaScript
```typescript
// Fetch groups ordered by order_index
const { data: groupsData } = await supabase
  .from('lesson_groups')
  .select('id, order_index')
  .eq('lesson_id', lessonId)
  .order('order_index', { ascending: true });

// Create group order map
const groupOrderMap = new Map(
  groupsData?.map((g, i) => [g.id, g.order_index ?? i]) ?? []
);

// Fetch slides
const { data: slidesData } = await supabase
  .from('slides')
  .select('id, group_id, type, props_json, aid_hook, order_index')
  .eq('lesson_id', lessonId);

// Sort slides by group order, then slide order
const sortedSlides = (slidesData ?? []).sort((a, b) => {
  const groupOrderA = groupOrderMap.get(a.group_id) ?? 999;
  const groupOrderB = groupOrderMap.get(b.group_id) ?? 999;
  
  if (groupOrderA !== groupOrderB) {
    return groupOrderA - groupOrderB;
  }
  
  return (a.order_index ?? 999) - (b.order_index ?? 999);
});
```

### Option 3: Use a computed global order_index
Store a global `order_index` on slides that accounts for group ordering, but this would require data migration.

## Recommended Fix
Use **Option 1** (SQL JOIN) as it's the most efficient and handles ordering at the database level.

