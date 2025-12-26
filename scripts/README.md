# Scripts Directory

Utility scripts for development and maintenance.

## Verification Script

### verify-slide-config-migration.ts

Verifies that the slide configuration tables migration was executed successfully.

**Prerequisites:**
- Environment variables must be set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to Run:**

**Option 1: Using npm script (requires tsx)**
```bash
npm run verify-migration
```

**Option 2: Using tsx directly**
```bash
npx tsx scripts/verify-slide-config-migration.ts
```

**Option 3: Using ts-node**
```bash
npx ts-node scripts/verify-slide-config-migration.ts
```

**Option 4: Compile and run**
```bash
# Compile TypeScript
npx tsc scripts/verify-slide-config-migration.ts --outDir scripts/dist --esModuleInterop --module esnext --target es2020

# Run compiled JavaScript
node scripts/dist/verify-slide-config-migration.js
```

**What it checks:**
1. ✅ `slide_field_registry` table exists
2. ✅ `slide_type_configs` table exists
3. ✅ `slides.config_version` column exists
4. ✅ `slides.config_snapshot` column exists
5. ✅ Can write to `slide_field_registry`
6. ✅ Can write to `slide_type_configs`
7. ✅ Table structures are correct
8. ✅ Required columns are accessible

**Expected Output:**
```
🔍 Verifying slide configuration migration...

📊 Verification Results:

✅ PASS slide_field_registry table exists
   Table exists and is accessible

✅ PASS slide_type_configs table exists
   Table exists and is accessible

... (more checks)

Summary: 8/8 checks passed, 0/8 checks failed

✅ Migration verification successful! All checks passed.
   You can proceed to Step 2: Extract Field Registry
```

