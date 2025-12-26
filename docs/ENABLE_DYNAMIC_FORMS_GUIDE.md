# How to Enable Dynamic Forms in `.env.local`

## Quick Setup

Add these two lines to your `.env.local` file:

```bash
NEXT_PUBLIC_USE_DYNAMIC_FORM=true
NEXT_PUBLIC_DYNAMIC_FORM_TYPES=text-slide,title-slide,lesson-end,ai-speak-repeat,ai-speak-student-repeat,speech-match
```

## Options

### Option 1: Enable for Specific Types (Recommended)
```bash
NEXT_PUBLIC_USE_DYNAMIC_FORM=true
NEXT_PUBLIC_DYNAMIC_FORM_TYPES=text-slide,title-slide,lesson-end,ai-speak-repeat,ai-speak-student-repeat,speech-match
```

This enables dynamic forms only for the listed slide types. Other types will use legacy forms.

### Option 2: Enable for ALL Types
```bash
NEXT_PUBLIC_USE_DYNAMIC_FORM=true
NEXT_PUBLIC_DYNAMIC_FORM_TYPES=
```

Leave `DYNAMIC_FORM_TYPES` empty to enable dynamic forms for all slide types automatically.

### Option 3: Enable for One Type (Testing)
```bash
NEXT_PUBLIC_USE_DYNAMIC_FORM=true
NEXT_PUBLIC_DYNAMIC_FORM_TYPES=text-slide
```

Enable only for `text-slide` to test before rolling out to all types.

## Available Slide Types

You can include any of these slide types in the comma-separated list:

- `text-slide`
- `title-slide`
- `lesson-end`
- `ai-speak-repeat`
- `ai-speak-student-repeat`
- `speech-match`

## After Making Changes

1. **Restart your dev server** (required for env changes):
   ```bash
   # Stop the server (Ctrl+C) then:
   npm run dev
   ```

2. **Verify it's working**:
   - Navigate to any slide edit page (e.g., `/edit-slide/[slideId]`)
   - The form should now be rendered dynamically based on the configuration
   - Check browser console for any errors

## Disable Dynamic Forms

To disable and go back to legacy forms:

```bash
NEXT_PUBLIC_USE_DYNAMIC_FORM=false
```

Or simply remove/comment out both lines.

## Troubleshooting

### Forms Still Using Legacy Code?
- ✅ Make sure you restarted the dev server after changing `.env.local`
- ✅ Check that `NEXT_PUBLIC_USE_DYNAMIC_FORM=true` (exactly "true", not `True` or `TRUE`)
- ✅ Verify the slide type is in the `DYNAMIC_FORM_TYPES` list (if using specific types)

### Configuration Changes Not Appearing?
- ✅ Make sure you saved the configuration in `/manage-slide-configs`
- ✅ Refresh the slide edit page to reload the latest config version
- ✅ Check that the config is marked as `isActive: true`

### Still Having Issues?
1. Check browser console for errors
2. Verify config exists: Run `npx tsx scripts/test-all-slide-configs.ts`
3. Check feature flag status in browser console:
   ```javascript
   // In browser console on edit-slide page:
   // The page should show dynamic form if enabled
   ```

## Example `.env.local` File

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Dynamic Form Feature Flags
NEXT_PUBLIC_USE_DYNAMIC_FORM=true
NEXT_PUBLIC_DYNAMIC_FORM_TYPES=text-slide,title-slide,lesson-end,ai-speak-repeat,ai-speak-student-repeat,speech-match
```

## Important Notes

- ⚠️ **Environment variables must start with `NEXT_PUBLIC_`** to be accessible in the browser
- ⚠️ **Changes require server restart** - Next.js caches env vars at build/start time
- ✅ **Feature flags allow instant rollback** - Just change to `false` and restart
- ✅ **Both legacy and dynamic forms work** - You can enable gradually

---

**Ready to enable?** Add the two lines to `.env.local` and restart your dev server! 🚀

