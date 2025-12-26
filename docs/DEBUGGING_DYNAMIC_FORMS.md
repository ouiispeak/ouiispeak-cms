# Debugging: Why Legacy Forms Are Still Showing

## Quick Answer

**Step 9 won't fix this** - Step 9 is just testing. The issue is likely that **the dev server needs to be restarted** for environment variables to take effect.

---

## Most Common Issue: Dev Server Not Restarted

### Problem
Environment variables (`NEXT_PUBLIC_*`) are cached by Next.js when the dev server starts. Changes to `.env.local` won't take effect until you restart.

### Solution
1. **Stop the dev server** (Ctrl+C or Cmd+C)
2. **Start it again**: `npm run dev`
3. **Hard refresh browser** (Ctrl+Shift+R / Cmd+Shift+R)

---

## Debugging Steps

### Step 1: Verify Feature Flags Are Set

Run the debug script:
```bash
npx tsx scripts/debug-feature-flags.ts
```

Expected output:
```
USE_DYNAMIC_SLIDE_FORM: true
DYNAMIC_FORM_TYPES.length: 6 (or 0 for all types)
```

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to a slide edit page
4. Look for:
   - Any errors from `DynamicSlideForm`
   - Any errors from `useSlideTypeConfig`
   - The debug message showing `slideType` and `shouldUseDynamicForm` value

### Step 3: Verify slideType Is Set

The debug component (added to edit-slide page) will show:
```
Debug: slideType="text-slide", shouldUseDynamicForm=true/false
```

**If `slideType` is empty or undefined:**
- The slide data hasn't loaded yet
- Check `loadState.status` - should be "ready"
- Check for errors in `SlideFormLoader`

**If `shouldUseDynamicForm` is false:**
- Feature flag is disabled
- Restart dev server
- Check `.env.local` file

### Step 4: Check DynamicSlideForm Errors

If dynamic form is rendering but showing errors:
- Check browser console for specific error messages
- Verify config exists: Run `npx tsx scripts/test-all-slide-configs.ts`
- Check network tab for failed API calls

---

## Common Issues & Solutions

### Issue 1: Feature Flag Not Working

**Symptoms:** `shouldUseDynamicForm` returns false even though env vars are set

**Solutions:**
1. ✅ Restart dev server (most common fix)
2. ✅ Check `.env.local` file exists and has correct values
3. ✅ Verify no typos: `NEXT_PUBLIC_USE_DYNAMIC_FORM=true` (not `True` or `TRUE`)
4. ✅ Check file is in project root (same directory as `package.json`)

### Issue 2: slideType Is Empty

**Symptoms:** Debug shows `slideType=""` or `slideType=undefined`

**Solutions:**
1. ✅ Check `loadState.status` - should be "ready"
2. ✅ Verify slide data loaded correctly
3. ✅ Check for errors in `useSlideFormData` hook

### Issue 3: Dynamic Form Shows Error

**Symptoms:** Dynamic form renders but shows error message

**Solutions:**
1. ✅ Check browser console for specific error
2. ✅ Verify config exists in database
3. ✅ Run: `npx tsx scripts/test-all-slide-configs.ts`
4. ✅ Check network tab for failed API calls to Supabase

### Issue 4: Config Not Found

**Symptoms:** "No configuration found for slide type: X"

**Solutions:**
1. ✅ Create config: Go to `/manage-slide-configs` and save config
2. ✅ Verify config is active: Check `isActive: true` in database
3. ✅ Run: `npx tsx scripts/create-all-slide-configs.ts` to create all configs

---

## Step 9 Won't Fix This

**Step 9 is just testing** - it's about:
- Enabling feature flag for one type
- Testing that dynamic form works
- Comparing with legacy form

**It won't fix the issue** if dynamic forms aren't showing. The problem is likely:
1. Dev server not restarted (90% of cases)
2. Feature flag not set correctly
3. slideType not being passed correctly

---

## Quick Fix Checklist

- [ ] Restart dev server (`npm run dev`)
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Check `.env.local` has correct values
- [ ] Verify no typos in env var names
- [ ] Check browser console for errors
- [ ] Verify slideType is set (check debug message)
- [ ] Verify config exists in database

---

## Still Not Working?

If you've tried everything above:

1. **Check the debug message** on the edit-slide page (in development mode)
2. **Share the output** of:
   - `npx tsx scripts/debug-feature-flags.ts`
   - Browser console errors
   - The debug message from the page

This will help identify the exact issue.

---

## Expected Behavior After Fix

Once working, you should see:
- ✅ Dynamic form renders (not legacy form)
- ✅ Form fields match the configuration
- ✅ Fields are organized by sections
- ✅ Save functionality works
- ✅ No errors in console

