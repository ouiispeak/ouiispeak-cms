# Phase 2 Testing Guide

## Pre-Existing Issues Found

During testing, I discovered some pre-existing TypeScript errors in the codebase:
1. `AudioFileSelector.tsx` - Uses `uiTokens.space.xs` and `uiTokens.radius.xs` which don't exist (fixed 2 instances, but there are more)
2. `ChoiceElementMapper.tsx` - Uses `folder` prop on `AudioFileSelector` which doesn't exist

These are **not related to Phase 2 components** but need to be fixed for the build to pass.

## Phase 2 Components Status

### ✅ Components Created (All Compile Correctly)

1. **`lib/hooks/useSlideTypeConfig.ts`** - ✅ No errors
2. **`components/slide-editor/FieldRenderer.tsx`** - ✅ No errors  
3. **`components/slide-editor/SectionRenderer.tsx`** - ✅ No errors
4. **`components/slide-editor/DynamicSlideForm.tsx`** - ✅ No errors
5. **`components/slide-editor/DynamicSlideFormWrapper.tsx`** - ✅ No errors
6. **`lib/config/featureFlags.ts`** - ✅ No errors
7. **`lib/utils/formUtils.ts`** - ✅ No errors
8. **`app/test-dynamic-form/page.tsx`** - ✅ No errors (test page created)

### ⚠️ Integration Issues

- `app/edit-slide/[slideId]/page.tsx` - Fixed type definition for `initialValuesRef` to include `lessonEndMessage` and `lessonEndActions`

## Manual Testing Steps

Since the build has pre-existing errors, here's how to test Phase 2 components:

### Step 1: Fix Pre-Existing Errors (Optional but Recommended)

Fix the remaining `uiTokens.space.xs` and `uiTokens.radius.xs` references in `AudioFileSelector.tsx`:
- Replace `uiTokens.space.xs` with `uiTokens.space.sm` (or appropriate value)
- Replace `uiTokens.radius.xs` with `uiTokens.radius.sm`

Fix `ChoiceElementMapper.tsx`:
- Remove or handle the `folder` prop on `AudioFileSelector`

### Step 2: Test Hook in Browser Console

1. Start dev server: `npm run dev`
2. Open browser console on any page
3. Test the hook manually:

```javascript
// In browser console
const response = await fetch('/api/test-config?type=text-slide');
const data = await response.json();
console.log(data);
```

Or import and test directly in a component.

### Step 3: Test Dynamic Form Page

1. Navigate to: `http://localhost:3001/test-dynamic-form`
2. Verify:
   - ✅ Page loads without errors
   - ✅ Feature flag status displays correctly
   - ✅ Hook loads configuration (check console for errors)
   - ✅ Configuration displays when loaded
   - ✅ Form renders with fields
   - ✅ Changing values updates the form values display
   - ✅ No console errors

### Step 4: Test with Real Data

1. Ensure `text-slide` configuration exists in database (already created)
2. Test page should load configuration automatically
3. Verify fields match expected:
   - Identity section: slideId, slideType, groupId, groupName, orderIndex, label
   - Content section: title, subtitle, body, buttons

### Step 5: Test Field Rendering

For each field type, verify:
- ✅ Text fields render correctly
- ✅ Textarea fields render correctly  
- ✅ Select fields render correctly (if applicable)
- ✅ Checkbox fields render correctly (if applicable)
- ✅ Read-only fields display correctly

### Step 6: Test Form Value Changes

1. Change a field value
2. Verify:
   - ✅ Console logs the change
   - ✅ Form values display updates
   - ✅ No errors occur

## Expected Results

### ✅ Success Criteria

1. **Hook Test:**
   - Configuration loads for `text-slide`
   - No errors in console
   - Configuration structure matches database

2. **Form Test:**
   - Form renders with correct sections
   - Fields appear in correct order
   - Values can be changed
   - No console errors

3. **Integration Test (Future):**
   - Feature flag works correctly
   - Dynamic form can replace hardcoded form
   - Save functionality works

## Known Limitations

1. **Pre-existing build errors** - Need to be fixed before full integration
2. **Complex components** - StudentRepeatElementMapper, ChoiceElementMapper may need additional props
3. **State management** - Full integration needs careful mapping between state and form values

## Next Steps After Testing

1. Fix pre-existing TypeScript errors
2. Verify all tests pass
3. Integrate with edit-slide page (with feature flag)
4. Test with real slide data
5. Verify save functionality works

## Quick Test Command

```bash
# Check if test page compiles (ignoring other errors)
npx tsc --noEmit app/test-dynamic-form/page.tsx lib/hooks/useSlideTypeConfig.ts components/slide-editor/*.tsx lib/config/featureFlags.ts lib/utils/formUtils.ts
```

This will verify Phase 2 components compile correctly in isolation.

