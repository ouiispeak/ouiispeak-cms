# Setting Up Environment Variables

The verification script and application need Supabase credentials to connect to your database.

## Step 1: Create .env.local file

Create a file named `.env.local` in the root of the project (same directory as `package.json`).

```bash
# From the project root
touch .env.local
```

## Step 2: Add Your Supabase Credentials

Open `.env.local` and add the following:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Find Your Supabase Credentials

### Option A: Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Find:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B: If You Already Have Them

If you've run the app before, you might already have these values. Check:
- Your Supabase project dashboard
- Any existing documentation
- Your deployment environment (Vercel, etc.)

## Step 4: Example .env.local File

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0aWQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk5ODk5OSwiZXhwIjoxOTYxNTc0OTk5fQ.example
```

**Important:**
- Replace the example values with your actual credentials
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Keep these credentials secure

## Step 5: Verify Setup

After creating `.env.local`, run the verification script:

```bash
npx tsx scripts/verify-slide-config-migration.ts
```

Or if you've installed tsx:

```bash
npm run verify-migration
```

## Troubleshooting

**If you get "command not found" for tsx:**
- The script will install it automatically with `npx`
- Or install it: `npm install -D tsx`

**If environment variables still not found:**
- Make sure `.env.local` is in the project root (same directory as `package.json`)
- Make sure there are no spaces around the `=` sign
- Make sure there are no quotes around the values (unless the value itself contains spaces)
- Restart your terminal after creating the file

**If you don't have Supabase credentials:**
- You'll need access to the Supabase project
- Contact your team lead or project administrator
- Check if credentials are stored in a password manager or deployment platform

