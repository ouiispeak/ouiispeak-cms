# Authoring Tables

## Overview

This document explains the relationship between production tables and authoring tables in the CMS.

## Production Tables (Source of Truth)

The following tables are the **production source of truth** for the CMS:

- `modules` - Course modules
- `lessons` - Individual lessons within modules
- `lesson_groups` - Groups of slides within lessons
- `slides` - Individual slide content

All standard CMS workflows (create, edit, browse) operate on these production tables. These are the tables that the player application reads from.

## Authoring Tables (Legacy/Experimental)

The following tables are **legacy/experimental** and are used for authoring workflows:

- `lessons_authoring` - Experimental lesson authoring
- `lesson_groups_authoring` - Experimental group authoring
- `slides_authoring` - Experimental slide authoring

### Debug Routes

Pages that interact with authoring tables have been moved under `/app/debug/*` and are hidden behind a feature flag:

- `/debug/new-slide-ai` - Create slides in `slides_authoring` table
- `/debug/edit-slide-ai` - Edit slides in `slides_authoring` table
- `/debug/slides-browser` - Browse authoring tables

These routes are **not available by default** and require the debug flag to be enabled.

## Enabling Debug Routes Locally

To enable debug routes for local development:

1. Create or edit `.env.local` in the project root
2. Add the following line:
   ```
   NEXT_PUBLIC_ENABLE_DEBUG=true
   ```
3. Restart the development server (`npm run dev`)

**Note:** Debug routes are disabled in production by default. Do not enable `NEXT_PUBLIC_ENABLE_DEBUG` in production environments.

## Migration Path

If you need to migrate data from authoring tables to production tables, use the standard CMS workflows:

1. Use production table pages (`/new-slide`, `/edit-slide`, etc.) to create/edit content
2. Authoring tables are kept for reference but are not part of the standard workflow

## Why Debug Quarantine?

Authoring tables were experimental and may have different schemas or behaviors than production tables. By quarantining these routes behind a debug flag:

- Production workflows remain clean and focused
- Experimental features don't confuse normal users
- Legacy code can be maintained separately without affecting production
- Clear separation between production and experimental features

