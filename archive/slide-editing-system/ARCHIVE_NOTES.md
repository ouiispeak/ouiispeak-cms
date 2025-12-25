# Slide Editing System Archive

## Archive Date
Archived during system cleanup to focus on core hierarchy: CEFR → Modules → Lessons → Groups

## What Was Archived

### Routes/Pages
- `/app/edit-slide/[slideId]/` - Individual slide editing
- `/app/new-slide/` - New slide creation
- `/app/cms/slide-types/` - Slide type configuration

### Components
- `/components/slide-editors/` - All slide editor components
- `/components/debug/SchemaDebugPanel.tsx` - Debug panel for slide schema

### Libraries
- `/lib/slide-editor-registry/` - Slide editor registry system
- `/lib/slide-editor-registry-v2/` - Attempted system reset (incomplete)

## Current System

The system now only supports:
- **CEFR** - CEFR level management
- **Modules** - Module management within CEFR levels
- **Lessons** - Lesson management within modules
- **Groups** - Group management within lessons

Slide menu item remains in TopNav but editing functionality is archived.

## Future Implementation

When re-implementing slide editing:
1. Start with a clean, simple edit-slide page
2. Build step-by-step, testing at each phase
3. Reference archived code for patterns but rebuild cleanly

