# How to See Network Requests in DevTools

## Step-by-Step Guide

### Step 1: Clear Network Tab

1. **Open DevTools** (F12)
2. **Go to Network Tab**
3. **Click the "Clear" button** (🚫 icon) to clear old requests
4. **Make sure "Preserve log" is checked** (so requests don't disappear)

### Step 2: Capture Save Request

1. **Type something in the title field**
2. **Click "Save Changes"**
3. **Look in Network tab** for a request that says:
   - `PATCH` or `PUT` method
   - URL contains `/rest/v1/slides` or `/slides`
   - Status should be `200` or `204` (success)

4. **Click on that request**
5. **Go to "Payload" or "Request" tab** - this shows what was SENT
6. **Go to "Response" or "Preview" tab** - this shows what was RETURNED

**What to share:**
- The **Payload/Request** tab content (what was sent)
- The **Response/Preview** tab content (what was returned)

### Step 3: Capture Load Request

1. **Hard refresh the page** (Ctrl+Shift+R / Cmd+Shift+R)
2. **Look in Network tab** for a request that says:
   - `GET` method
   - URL contains `/rest/v1/slides` or `/slides`
   - Contains the slide ID in the URL

3. **Click on that request**
4. **Go to "Response" or "Preview" tab**

**What to share:**
- The **Response/Preview** tab content (what was loaded)

---

## Alternative: Use Console Logs

Since network requests can be hard to find, I've added console logging that will show:

### When Saving:
- `[Save] About to save to database:` - Shows what's being saved
- `[Save] props_json:` - Shows the props_json being saved
- `[Save] Success! Saved data:` - Shows what was returned from database

### When Loading:
- `[loadSlideById] Loading slide:` - Shows which slide is being loaded
- `[loadSlideById] Response props_json:` - Shows what props_json was loaded
- `[Load] propsJson from database:` - Shows the raw props_json
- `[Load] typedProps after getTypedSlideProps:` - Shows extracted props
- `[Load] extractInitialFormValues - title:` - Shows title in initial values
- `[Load] useSlideFormState - setting state.title:` - Shows title being set

---

## What to Do

1. **Clear the Network tab** (click the clear button)
2. **Open Console tab** (so you can see logs)
3. **Type in title field** and **click Save**
4. **Check Console** for `[Save]` logs
5. **Hard refresh** the page
6. **Check Console** for `[Load]` logs
7. **Share all the console logs** that start with `[Save]` or `[Load]`

This will show us exactly what's being saved and what's being loaded!

---

## Quick Checklist

- [ ] Network tab cleared
- [ ] Console tab open
- [ ] Type in title → Save → Check `[Save]` logs
- [ ] Hard refresh → Check `[Load]` logs
- [ ] Share all `[Save]` and `[Load]` console logs

