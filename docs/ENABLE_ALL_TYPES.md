# Enable Dynamic Forms for All Types

## Quick Enable

To enable dynamic forms for all slide types, add or update these lines in `.env.local`:

```bash
NEXT_PUBLIC_USE_DYNAMIC_FORM=true
NEXT_PUBLIC_DYNAMIC_FORM_TYPES=text-slide,title-slide,lesson-end,ai-speak-repeat,ai-speak-student-repeat,speech-match
```

Or, to enable for ALL types automatically (leave DYNAMIC_FORM_TYPES empty):

```bash
NEXT_PUBLIC_USE_DYNAMIC_FORM=true
NEXT_PUBLIC_DYNAMIC_FORM_TYPES=
```

## What This Does

- **All slide types** will use the dynamic form system
- Forms will be rendered based on database configurations
- Legacy hardcoded forms will be bypassed
- Feature flag allows instant rollback if needed

## Verification

After enabling:
1. Restart dev server: `npm run dev`
2. Navigate to any slide edit page
3. Verify dynamic form renders
4. Test editing and saving
5. Check browser console for errors

## Rollback

To rollback, simply set:
```bash
NEXT_PUBLIC_USE_DYNAMIC_FORM=false
```

Or remove the environment variables entirely.

## Status

✅ All 6 slide types have configurations
✅ All configurations tested and verified
✅ Dynamic form system ready for production

