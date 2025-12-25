# Debugging Plan: System Fields Still Appearing

## Problem
System fields (slideId, slideType, groupId, orderIndex) are still appearing in slide editors even though:
- Default preset has them in hiddenFieldKeys
- Child type presets have only ["label"] in visibleFieldKeys
- Code defaults should override localStorage

## Root Cause Hypotheses

### Hypothesis 1: Schema Not Being Computed Correctly
- `getVisibleFieldsForType()` might not be filtering correctly
- `resolveSlideTypeVisibility()` might have a bug
- Check: Add logging to see what schema.fields actually contains

### Hypothesis 2: Caching/Memoization Issue
- React might be caching old schema
- Next.js might be caching the page
- Check: Force re-computation on every render

### Hypothesis 3: localStorage Still Overriding
- Code defaults might not be applied correctly
- Check: Log what `getPresetsConfig()` actually returns

### Hypothesis 4: Wrong Type Being Passed
- `loadState.row.type` might be wrong
- Type normalization might be incorrect
- Check: Log the actual type being used

## Debugging Steps

### Step 1: Add Debug Logging
Add console.logs to trace the flow:
1. In `getPresetsConfig()` - log what presets are returned
2. In `resolveSlideTypeVisibility()` - log inputs and outputs
3. In `getVisibleFieldsForType()` - log what fields are returned
4. In `DefaultSlideEditor` - log what schema.fields contains

### Step 2: Verify Preset Loading
Check if localStorage is being cleared correctly and code defaults are applied.

### Step 3: Check Type Normalization
Verify that "title-slide" vs "title" is handled correctly.

### Step 4: Test Directly
Create a test that calls the resolver directly with known inputs.

## Action Items
1. Add comprehensive logging
2. Create a debug panel component
3. Test with fresh localStorage
4. Verify resolver logic step-by-step

