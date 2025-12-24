# Slide System Hierarchy - Sanity Test

This test verifies that the refactored slide system hierarchy is working correctly according to the requirements.

## Test 1: Non-Propagating Visibility (Critical)

**Goal**: Verify that making a field visible in Default does NOT automatically make it visible in other slide types.

### Steps:
1. Navigate to `/cms/slide-types/default/edit`
2. Find a field that is currently **visible** (e.g., "Default language")
3. Click the hide button (→) to move it to the "Hidden fields" column
4. Navigate to `/cms/slide-types/ai-speak-repeat/edit`
5. Check the "Hidden fields" column

**Expected Result**: 
- ✅ The field should appear in the "Hidden fields" column for `ai-speak-repeat`
- ✅ It should NOT automatically appear in the "Visible fields" column
- ✅ The field should be marked as "(hidden by default)" if it's in the default-hidden section

### Reverse Test:
1. In `/cms/slide-types/default/edit`, move "Default language" back to "Visible fields"
2. Navigate to `/cms/slide-types/ai-speak-repeat/edit`
3. Check the "Hidden fields" column

**Expected Result**:
- ✅ The field should STILL be in the "Hidden fields" column for `ai-speak-repeat`
- ✅ It should NOT automatically move to "Visible fields"
- ✅ You must manually click the show button (⊕) to make it visible

---

## Test 2: Explicit Allowlist for Non-Default Types

**Goal**: Verify that non-default slide types use `visibleFieldKeys` as an explicit allowlist.

### Steps:
1. Navigate to `/cms/slide-types/ai-speak-repeat/edit`
2. Open browser DevTools → Application → Local Storage → `slideTypePresets`
3. Find the entry for `ai-speak-repeat`

**Expected Result**:
- ✅ The preset should have `visibleFieldKeys` array (not just `hiddenFieldKeys`)
- ✅ Only fields explicitly listed in `visibleFieldKeys` should be visible
- ✅ Fields NOT in `visibleFieldKeys` should be hidden, even if visible in Default

### Manual Verification:
1. In `/cms/slide-types/ai-speak-repeat/edit`, note which fields are visible
2. Check the localStorage JSON - the `visibleFieldKeys` array should match exactly

---

## Test 3: getVisibleSchemaForType() is Single Source of Truth

**Goal**: Verify that `getVisibleSchemaForType()` determines what fields are editable.

### Steps:
1. Navigate to `/edit-slide/[any-slide-id]` (or create a new slide)
2. Change the slide type to `ai-speak-repeat` (if not already)
3. Open the Schema Debug Panel (at bottom of page)
4. Compare the fields shown in the editor vs. what the debug panel reports

**Expected Result**:
- ✅ The editor should only show fields listed in `visibleSchema.fields`
- ✅ The debug panel should show the same field count
- ✅ No "leaked fields" warning should appear

### Test with Different Slide Types:
1. Edit a `text-slide` - verify only text-slide fields are shown
2. Edit a `title-slide` - verify only title-slide fields are shown
3. Edit a `default` slide - verify all fields (except hidden) are shown

---

## Test 4: No Schema in SlideEditorDefinition

**Goal**: Verify that slide type definitions no longer contain schemas.

### Steps:
1. Open browser DevTools → Console
2. Run: `import('@/lib/slide-editor-registry').then(m => console.log(m.getSlideEditorDefinition('ai-speak-repeat')))`

**Expected Result**:
- ✅ The object should have: `type`, `label`, `editorComponent`
- ✅ It should NOT have a `schema` property
- ✅ Console should show: `{type: "ai-speak-repeat", label: "AI Speak Repeat", editorComponent: ƒ}`

---

## Test 5: Editor Respects schema.fields

**Goal**: Verify that editors only render fields from `schema.fields`.

### Steps:
1. Navigate to `/cms/slide-types/ai-speak-repeat/edit`
2. Hide a field (e.g., "Subtitle")
3. Navigate to `/edit-slide/[any-ai-speak-repeat-slide]`
4. Check if "Subtitle" field appears

**Expected Result**:
- ✅ The "Subtitle" field should NOT appear in the editor
- ✅ The Schema Debug Panel should show it as hidden
- ✅ Saving the slide should not include the hidden field

### Test with DefaultSlideEditor:
1. Navigate to `/edit-slide/[any-default-slide]`
2. Hide a field in `/cms/slide-types/default/edit`
3. Refresh the edit slide page
4. The field should disappear from the editor

---

## Test 6: New Field Added to Default

**Goal**: Verify that new fields added to Default appear hidden in other types.

### Steps:
1. Navigate to `/cms/slide-types/default/edit`
2. Move a field from "Hidden" to "Visible" (e.g., "Is activity")
3. Navigate to `/cms/slide-types/ai-speak-repeat/edit`
4. Check the "Hidden fields" column

**Expected Result**:
- ✅ The field should appear in "Hidden fields" for `ai-speak-repeat`
- ✅ It should NOT automatically appear in "Visible fields"
- ✅ You must manually move it to "Visible fields" to use it

---

## Test 7: Backward Compatibility

**Goal**: Verify that existing presets still work.

### Steps:
1. Check localStorage for `slideTypePresets`
2. If there are presets with only `hiddenFieldKeys` (no `visibleFieldKeys`), verify they still work

**Expected Result**:
- ✅ The resolver should compute `visibleFieldKeys` from `hiddenFieldKeys` for backward compatibility
- ✅ Existing presets should continue to work
- ✅ New presets should use `visibleFieldKeys` format

---

## Quick Visual Checklist

When testing, verify these visual indicators:

- [ ] Slide type editor shows "Visible fields" and "Hidden fields" columns
- [ ] Non-default types show "(hidden by default)" label for default-hidden fields
- [ ] Schema Debug Panel shows correct field counts
- [ ] No console errors about missing `schema` property
- [ ] Editors only show fields that are in the visible schema
- [ ] Hidden fields don't appear in editors (unless "Show hidden fields" is toggled)

---

## Expected Behavior Summary

✅ **Correct Behavior:**
- Default type: Uses `hiddenFieldKeys` (everything visible except hidden)
- Non-default types: Use `visibleFieldKeys` (explicit allowlist, nothing visible unless listed)
- Making a field visible in Default does NOT propagate to other types
- Each slide type must explicitly opt-in to show fields
- `getVisibleSchemaForType()` is the single source of truth
- Editors iterate over `schema.fields` dynamically

❌ **Incorrect Behavior (should NOT happen):**
- Fields automatically appearing in other types when made visible in Default
- Slide type definitions having `schema` property
- Editors showing fields not in `schema.fields`
- Hydration mismatches
- Console errors about undefined properties

---

## If Tests Fail

1. Check browser console for errors
2. Check localStorage for `slideTypePresets` - verify format
3. Clear localStorage and test with fresh presets
4. Check that `getVisibleSchemaForType()` is being called correctly
5. Verify the resolver is using non-propagating logic for non-default types

