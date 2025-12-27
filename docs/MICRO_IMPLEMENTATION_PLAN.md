# Micro-Implementation Plan: Tier 1 Environment Variables

**Goal:** Identify exactly where the environment variable problem occurs by implementing tiny steps and testing after each one.

---

## Step-by-Step Plan

### Phase 1: Basic File Structure (No Logic)
- [ ] **Step 1:** Create empty `lib/config/env.ts` with just exports
- [ ] **Step 2:** Test import works (no errors)

### Phase 2: Single Simple Getter (No Validation)
- [ ] **Step 3:** Add one getter that returns `process.env.NEXT_PUBLIC_SUPABASE_URL` directly
- [ ] **Step 4:** Test getter works in Node.js script
- [ ] **Step 5:** Test getter works when Next.js dev server starts
- [ ] **Step 6:** Test getter works in browser/client-side

### Phase 3: Add Second Getter
- [ ] **Step 7:** Add second getter for `supabaseAnonKey`
- [ ] **Step 8:** Test both getters work (server + client)

### Phase 4: Integrate with Supabase Client
- [ ] **Step 9:** Update `supabase.ts` to use `env.ts` (keep old code as fallback)
- [ ] **Step 10:** Test Supabase client works

### Phase 5: Add Validation (Only if Previous Steps Pass)
- [ ] **Step 11:** Add validation function (but don't use it yet)
- [ ] **Step 12:** Test validation function separately
- [ ] **Step 13:** Add validation to getters
- [ ] **Step 14:** Test validation works

---

## Testing Strategy

After each step, we'll test:
1. **Node.js script** - Can we import and use it?
2. **Dev server startup** - Does Next.js start without errors?
3. **Browser/client-side** - Does it work in the browser?

If any step fails, we stop and investigate that exact step.

---

## Success Criteria

- Each step must pass all three tests before moving to next step
- If browser test fails, we identify the exact line/pattern causing it
- We document what works and what doesn't at each step

