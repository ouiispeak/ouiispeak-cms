# Debugging: Data Not Loading After Save

## Step-by-Step DevTools Investigation

### Step 1: Check What's Saved in Database

**In Browser DevTools:**

1. **Open Network Tab** (F12 → Network)
2. **Refresh the page** (to see the initial load)
3. **Find the request** that loads the slide (look for something like `/rest/v1/slides?id=eq...` or similar)
4. **Click on that request**
5. **Go to "Response" or "Preview" tab**
6. **Look for `props_json`** - this is what's stored in the database

**What to share:**
- Copy the entire `props_json` object from the response
- Example: `{"title": "Woot Woot!", "isInteractive": false, ...}`

---

### Step 2: Check What Props Are Extracted

**In Browser Console:**

1. **Open Console Tab** (F12 → Console)
2. **Add this temporary debug code** - I'll add it to the code so you can see it
3. **Refresh the page**
4. **Look for logs** showing what props were extracted

**What to share:**
- Any console logs showing props extraction
- Any errors in red

---

### Step 3: Check React Component State

**Using React DevTools (if installed):**

1. **Install React DevTools** if you don't have it: https://react.dev/link/react-devtools
2. **Open React DevTools** (should appear as a tab in DevTools)
3. **Find the `EditSlidePage` component**
4. **Look at the `state` object** - check what `state.title` is
5. **Look at the `data` object** - check what `data.slide.propsJson` contains

**What to share:**
- What `state.title` shows
- What `data.slide.propsJson` contains

---

### Step 4: Check Form Field Values

**In Elements/Inspector Tab:**

1. **Open Elements Tab** (F12 → Elements or Inspector)
2. **Find the title input field** (use the selector tool or search for `<input`)
3. **Check the `value` attribute** - what does it show?

**What to share:**
- The `value` attribute of the title input field

---

## Quick Debug Code to Add

I'll add some temporary debug logging to help us see exactly what's happening. After I add it, refresh and check the console for:

1. `[Load] propsJson from database:` - Shows what's in the database
2. `[Load] typedProps after getTypedSlideProps:` - Shows what props were extracted
3. `[Load] initialValues.title:` - Shows what title was set in initial values
4. `[Load] state.title after initialization:` - Shows what title is in state

---

## Most Likely Issues

Based on the symptoms, here are the most likely problems:

### Issue A: Props Not Extracted Correctly
- **Symptom:** Database has `title`, but `typedProps` is `null` or `{}`
- **Check:** Console logs showing `getTypedSlideProps` result

### Issue B: Initial Values Not Set
- **Symptom:** `typedProps` has title, but `initialValues.title` is empty
- **Check:** Console logs showing `extractInitialFormValues` result

### Issue C: State Not Initializing
- **Symptom:** `initialValues.title` has value, but `state.title` is empty
- **Check:** React DevTools showing state values

### Issue D: Form Not Reading State
- **Symptom:** `state.title` has value, but input field is empty
- **Check:** Elements tab showing input `value` attribute

---

## What to Share

After checking the above, please share:

1. **Network Tab → Response:** The `props_json` from the database load request
2. **Console Tab:** Any logs I add (especially the ones starting with `[Load]`)
3. **Console Tab:** Any errors (red messages)
4. **Elements Tab:** The `value` attribute of the title input field

This will help me pinpoint exactly where the data is being lost!

