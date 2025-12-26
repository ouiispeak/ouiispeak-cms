# Edit-Slide Page Refactor - Test Plan

**Date:** [Current Date]  
**Refactor:** Extracted form sections into reusable components  
**Line Reduction:** 858 → 344 lines (60% reduction)

---

## ✅ Pre-Test Verification

### Build Status
- ✅ TypeScript compilation: **PASSED**
- ✅ Linting: **PASSED**
- ✅ All components exported correctly: **VERIFIED**

### Components Created
1. ✅ `IdentitySection.tsx`
2. ✅ `CoreContentSection.tsx`
3. ✅ `SlideTypeSpecificContentSection.tsx`
4. ✅ `LanguageSection.tsx`
5. ✅ `MediaSection.tsx`
6. ✅ `SpeechAudioInteractionSection.tsx`
7. ✅ `InteractionFlagsSection.tsx`
8. ✅ `InteractionFlowSection.tsx`
9. ✅ `AuthoringMetadataSection.tsx`

---

## 🧪 Test Cases

### Test 1: Page Load
**Objective:** Verify the page loads without errors

**Steps:**
1. Navigate to `/edit-slide/[any-slide-id]`
2. Check browser console for errors
3. Verify page renders

**Expected:**
- Page loads successfully
- No console errors
- All sections visible

**Status:** ⏳ **PENDING**

---

### Test 2: Identity Section
**Objective:** Verify Identity & Structure section displays correctly

**Steps:**
1. Load any slide
2. Check Identity section appears at top
3. Verify all fields are read-only except Label
4. Try editing Label field

**Expected:**
- Slide ID, Slide Type, Group ID, Group Name, Order Index are read-only
- Label field is editable
- All fields show correct values

**Status:** ⏳ **PENDING**

---

### Test 3: Core Content Section (Text/Title Slides)
**Objective:** Verify core content fields for text-slide and title-slide

**Steps:**
1. Load a `text-slide` or `title-slide`
2. Verify Title, Subtitle, Body, Buttons fields appear
3. Edit each field
4. Save and reload

**Expected:**
- All fields visible and editable
- Changes persist after save
- Fields load correctly on reload

**Status:** ⏳ **PENDING**

---

### Test 4: Lesson End Slide
**Objective:** Verify lesson-end slide specific fields

**Steps:**
1. Load a `lesson-end` slide
2. Verify Title, Message, Actions fields appear
3. Verify Subtitle and Body fields are NOT shown
4. Edit Message and Actions (JSON)
5. Save and reload

**Expected:**
- Message and Actions fields visible
- Subtitle and Body hidden
- JSON validation works
- Changes persist

**Status:** ⏳ **PENDING**

---

### Test 5: AI Speak Repeat Slide
**Objective:** Verify ai-speak-repeat slide fields

**Steps:**
1. Load an `ai-speak-repeat` slide
2. Verify Phrases field appears in Speech & Audio Interaction section
3. Verify Core Content section does NOT show Title/Subtitle/Body
4. Edit phrases (one per line)
5. Save and reload

**Expected:**
- Phrases field visible
- Core content fields hidden
- Changes persist

**Status:** ⏳ **PENDING**

---

### Test 6: AI Speak Student Repeat Slide
**Objective:** Verify ai-speak-student-repeat slide fields

**Steps:**
1. Load an `ai-speak-student-repeat` slide
2. Verify Instructions and Prompt Label appear in Core Content
3. Verify Practice Elements section appears
4. Add/edit practice elements
5. Verify Is Activity checkbox appears in Interaction Flags
6. Verify On Complete At Index appears in Interaction/Flow
7. Save and reload

**Expected:**
- All fields visible
- Element mapper works
- Changes persist

**Status:** ⏳ **PENDING**

---

### Test 7: Speech Match Slide
**Objective:** Verify speech-match slide fields

**Steps:**
1. Load a `speech-match` slide
2. Verify Title, Subtitle, Note appear in Core Content
3. Verify Choice Elements section appears
4. Add/edit choice elements
5. Save and reload

**Expected:**
- All fields visible
- Choice element mapper works
- Changes persist

**Status:** ⏳ **PENDING**

---

### Test 8: Language Section
**Objective:** Verify language selection works

**Steps:**
1. Load any interactive slide (not title/text)
2. Verify Language section appears
3. Change default language
4. Save and reload

**Expected:**
- Language dropdown works
- Changes persist

**Status:** ⏳ **PENDING**

---

### Test 9: Media Section
**Objective:** Verify audio file selector works

**Steps:**
1. Load any interactive slide (not title/text)
2. Verify Media Reference section appears
3. Browse and select audio file
4. Save and reload

**Expected:**
- Audio file selector works
- Selected file persists

**Status:** ⏳ **PENDING**

---

### Test 10: Interaction Flags Section
**Objective:** Verify interaction flags work

**Steps:**
1. Load any interactive slide (not title/text)
2. Verify Interaction Flags section appears
3. Toggle Is Interactive, Allow Skip, Allow Retry
4. For student-repeat: Toggle Is Activity
5. Save and reload

**Expected:**
- All checkboxes work
- Changes persist
- Is Activity only shows for student-repeat

**Status:** ⏳ **PENDING**

---

### Test 11: Interaction Flow Section
**Objective:** Verify attempt limits work

**Steps:**
1. Load any interactive slide (not title/text)
2. Verify Interaction/Flow section appears
3. Set Max Attempts
4. Set Min Attempts Before Skip
5. Test validation (min > max should show error)
6. For student-repeat: Set On Complete At Index
7. Save and reload

**Expected:**
- All fields work
- Validation works
- Changes persist
- On Complete At Index only shows for student-repeat

**Status:** ⏳ **PENDING**

---

### Test 12: Authoring Metadata Section
**Objective:** Verify activity name field

**Steps:**
1. Load any interactive slide (not title/text/lesson-end)
2. Verify Authoring Metadata section appears
3. Edit Activity Name
4. Save and reload

**Expected:**
- Activity Name field visible
- Changes persist
- Section hidden for title/text/lesson-end

**Status:** ⏳ **PENDING**

---

### Test 13: Dynamic Form Toggle
**Objective:** Verify dynamic form still works when enabled

**Steps:**
1. Enable dynamic form for a slide type in `.env.local`
2. Load that slide type
3. Verify dynamic form renders instead of legacy form
4. Edit and save

**Expected:**
- Dynamic form renders when feature flag enabled
- Legacy form renders when disabled
- Both work correctly

**Status:** ⏳ **PENDING**

---

### Test 14: Save Functionality
**Objective:** Verify save works for all slide types

**Steps:**
1. Load each slide type
2. Make changes to various fields
3. Click Save Changes
4. Verify success message
5. Hard refresh and verify changes persist

**Expected:**
- Save works for all types
- Success message appears
- Changes persist after refresh
- Unsaved changes warning works

**Status:** ⏳ **PENDING**

---

### Test 15: Validation
**Objective:** Verify pre-save validation still works

**Steps:**
1. Load an `ai-speak-repeat` slide
2. Clear all phrases
3. Try to save
4. Verify error message appears

**Expected:**
- Validation errors appear
- Save is blocked
- Error messages are clear

**Status:** ⏳ **PENDING**

---

## 🐛 Known Issues / Edge Cases to Test

1. **Empty fields:** Test with slides that have empty/null fields
2. **Special characters:** Test with special characters in text fields
3. **Long text:** Test with very long text in textarea fields
4. **JSON validation:** Test invalid JSON in buttons/actions fields
5. **Navigation:** Test navigating away with unsaved changes

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Page Load | ⏳ PENDING | |
| 2. Identity Section | ⏳ PENDING | |
| 3. Core Content (Text/Title) | ⏳ PENDING | |
| 4. Lesson End Slide | ⏳ PENDING | |
| 5. AI Speak Repeat | ⏳ PENDING | |
| 6. AI Speak Student Repeat | ⏳ PENDING | |
| 7. Speech Match | ⏳ PENDING | |
| 8. Language Section | ⏳ PENDING | |
| 9. Media Section | ⏳ PENDING | |
| 10. Interaction Flags | ⏳ PENDING | |
| 11. Interaction Flow | ⏳ PENDING | |
| 12. Authoring Metadata | ⏳ PENDING | |
| 13. Dynamic Form Toggle | ⏳ PENDING | |
| 14. Save Functionality | ⏳ PENDING | |
| 15. Validation | ⏳ PENDING | |

---

## ✅ Acceptance Criteria

- [ ] All sections render correctly for each slide type
- [ ] All form fields are editable and functional
- [ ] Save functionality works for all slide types
- [ ] Changes persist after save and reload
- [ ] Validation works correctly
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Performance is acceptable (no lag)

---

## 📝 Notes

- Test with real slide IDs from the database
- Test both legacy form and dynamic form (if enabled)
- Verify all conditional rendering works correctly
- Check that sections hide/show based on slide type

---

**Last Updated:** [Current Date]  
**Next Steps:** Run manual tests and update status

