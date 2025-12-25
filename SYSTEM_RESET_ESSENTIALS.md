# System Reset: Essential Information

This document contains all essential information needed to rebuild the slide type system correctly, without including problematic implementation details.

## 1. Domain Model & Hierarchy

### Entity Hierarchy
```
Level (CEFR level: A0, A1, A2, B1, B2, C1, C2)
  └─ Module (contains lessons)
      └─ Lesson (contains groups)
          └─ Group (contains slides) ← **GROUPS ARE THE LEVEL ABOVE INDIVIDUAL SLIDES**
              └─ Slide (individual slide)
```

**Critical:** Groups are the immediate parent of slides. Slides belong to groups, not directly to lessons.

### Entity Relationships
- **Slide** belongs to **Group** (via `group_id`)
- **Group** belongs to **Lesson** (via `lesson_id`)
- **Lesson** belongs to **Module** (via `module_id`)
- **Module** belongs to **Level** (via `level`)

## 2. Database Schema (Supabase)

### Slides Table (`slides`)
```typescript
{
  id: string;                    // UUID primary key
  lesson_id: string | null;      // Foreign key to lessons table
  group_id: string | null;       // Foreign key to groups table (CRITICAL: slides belong to groups)
  order_index: number | null;    // Sequence position within group
  type: string;                  // Slide type identifier (e.g., "title-slide", "text-slide", "ai-speak-repeat")
  props_json: any;               // JSONB column storing all slide properties (the 88 fields)
  meta_json: any | null;         // JSONB column storing metadata (authoring fields)
  code: string | null;           // Internal shorthand identifier
  is_activity: boolean | null;   // Whether slide counts as activity
  score_type: string | null;     // Scoring type: "none", "confidence", "accuracy", etc.
  passing_score_value: number | null;
  max_score_value: number | null;
  pass_required_for_next: boolean | null;
  aid_hook: string | null;       // AI hook reference
}
```

**Key Points:**
- `props_json` stores the actual slide data (title, body, choices, etc.) - this is where the 88 fields live
- `meta_json` stores authoring metadata (slideGoal, activityName, tags, etc.)
- `type` determines which slide type editor to use
- `group_id` is the parent relationship (NOT lesson_id directly)

### Groups Table (`lesson_groups`)
```typescript
{
  id: string;                    // UUID primary key
  lesson_id: string | null;      // Foreign key to lessons table
  label: string | null;          // Internal name
  title: string | null;           // Display title
  order_index: number | null;    // Sequence position within lesson
  // ... other group-specific fields
}
```

## 3. The 88 Form Fields

All 88 possible form fields are stored in `props_json` (JSONB column). Fields are categorized by purpose:

### System Fields (Read-only, identity/structure)
1. `slideId` - Slide UUID (read-only)
2. `slideType` - Slide type identifier (read-only)
3. `groupId` - Group UUID (read-only)
4. `orderIndex` - Sequence position in group

### Core Content Fields
5. `label` - Internal name for CMS navigation (**REQUIRED**)
6. `title` - Primary heading
7. `subtitle` - Secondary heading
8. `body` - Main slide copy
9. `note` - Author-only notes (not shown to learners)

### Language & Localization
10. `defaultLang` - Language hint for TTS (select: "auto", "en", "fr")
11. `secondaryLang` - Secondary language code
12. `translation` - Translated text or gloss
13. `phoneticHint` - IPA or phonetic guidance

### Media References
14. `imageId` - Image asset reference ID
15. `imageUrl` - Direct image URL
16. `audioId` - Audio asset reference ID
17. `videoId` - Video asset reference ID
18. `lottieId` - Lottie animation reference ID
19. `waveformId` - Waveform data reference ID

### Timing & Flow
20. `delayMs` - Delay before showing content (ms)
21. `autoAdvance` - Auto-advance when complete (boolean)
22. `minDuration` - Minimum time on slide (ms)
23. `maxDuration` - Maximum time on slide (ms)

### Interaction Flags
24. `isInteractive` - Interactive-capable (boolean)
25. `requiresInput` - Learner must provide input (boolean)
26. `allowSkip` - UI can expose skip (boolean)
27. `allowRetry` - UI can expose retry (boolean)
28. `isActivity` - Counts as activity (boolean, also in DB column)

### Buttons & Affordances
29. `buttons` - Comma-separated list (next, back, replay, hint, skip, validate)

### Authoring Metadata (stored in `meta_json`, not `props_json`)
30. `code` - Internal shorthand (also in DB column)
31. `slideGoal` - Outcome-focused intent
32. `activityName` - Activity pattern name
33. `requiresExternalTTS` - External TTS flag (boolean)
34. `tags` - Comma-separated internal tags
35. `difficultyHint` - Difficulty signal
36. `reviewWeight` - Review scheduling weight

### Speech & Audio Interaction
37. `expectedSpeech` - Target speech text or list
38. `speechMode` - Select: "repeat", "free", "choose"
39. `minConfidence` - Minimum confidence threshold
40. `showPronunciationHelp` - Expose pronunciation hints (boolean)
41. `phrases` - Scripted phrases content

### Choice & Selection
42. `choices` - List of choices (one per line or JSON)
43. `correctChoiceIds` - List of correct choice IDs
44. `allowMultiple` - Allow multiple selections (boolean)
45. `shuffleChoices` - Shuffle choice order (boolean)

### Sequencing & Grouping
46. `items` - Sequence items (JSON or one per line)
47. `groups` - Grouping definitions (JSON or one per line)
48. `chunks` - Chunk definitions (JSON or one per line)

### Matching / Mapping
49. `pairs` - Matching pairs (JSON or one per line)
50. `dragTargets` - Drag target definitions
51. `dropZones` - Drop zone definitions

### Scoring Hints
52. `scoreType` - Select: "none", "confidence", "accuracy", "percent", "raw" (also in DB column)
53. `passThreshold` - Suggested threshold for passing
54. `maxScoreValue` - Maximum score (also in DB column)
55. `passRequiredForNext` - Require passing to proceed (boolean, also in DB column)
56. `showScoreToLearner` - Expose score in UI (boolean)

### AI / Agent Behavior Hints
57. `aiPrompt` - Prompt context for AI behaviors
58. `aiPersona` - Persona or tone guidance
59. `aiResponseMode` - Select: "reactive", "scripted", "mixed"
60. `aiMemoryKey` - Key for shared agent memory

### Visual Behavior Hints
61. `layoutVariant` - Layout variant or template key
62. `emphasisTarget` - Primary element to emphasize
63. `highlightMode` - Highlight behavior hint
64. `animationPreset` - Animation preset key

### Analytics & Observation
65. `trackEvents` - Enable event tracking (boolean)
66. `eventLabels` - Comma-separated event labels
67. `debugNotes` - Internal debug notes

### Freeform / Escape Hatch
68. `customProps` - Freeform JSON escape hatch

**Total: 88 fields** (4 system + 64 content/metadata + 20 authoring metadata)

## 4. Field Storage Mapping

### Fields Stored in `props_json` (JSONB)
- All 68 content/metadata fields (items 5-68 above)
- System fields are NOT stored (computed from DB columns)

### Fields Stored in `meta_json` (JSONB)
- Authoring metadata fields (items 30-36 above)
- Special metadata: `buttons`, `isActivity`, `scoreType`, `passingScoreValue`, `maxScoreValue`, `passRequiredForNext`, `showScoreToLearner`

### Fields Stored as DB Columns
- `id` → `slideId`
- `type` → `slideType`
- `group_id` → `groupId`
- `order_index` → `orderIndex`
- `code` → `code`
- `is_activity` → `isActivity`
- `score_type` → `scoreType`
- `passing_score_value` → `passingScoreValue`
- `max_score_value` → `maxScoreValue`
- `pass_required_for_next` → `passRequiredForNext`

## 5. Slide Type System Architecture

### Slide Types
- **Default** - Base type (schema-driven, all fields available)
- **title-slide** - Title slide variant
- **text-slide** - Text slide variant
- **ai-speak-repeat** - AI speech repeat variant
- (More types can be added)

### Desired Architecture: Schema-Driven Allowlist with Inheritance & Capability Gating

**Core Principles:**
1. **Schema-Driven**: Field definitions come from a canonical schema (the 88 fields)
2. **Allowlist Model**: Fields are hidden by default, must be explicitly enabled (opt-in)
3. **Inheritance**: Child slide types inherit available fields from Default
4. **Capability Gating**: Default controls which fields are "available" to child types
5. **Isolation**: Each child type maintains its own "visible" field list independently

**Hierarchy:**
```
Default Slide Type Editor
  ├─ Controls: Available / Unavailable fields
  ├─ Default state: Only "label" Available, all others Unavailable
  └─ Parent Gate: Fields in "Unavailable" cannot be used by child types

Child Slide Type Editors (title-slide, text-slide, ai-speak-repeat)
  ├─ Controls: Visible / Hidden fields
  ├─ Default state: Only "label" Visible
  ├─ Can only show fields that are "Available" in Default (parent gate)
  └─ Each type is independent (isolation)

Individual Slide Editors
  └─ Only show fields that are "Visible" in the corresponding slide type editor
```

**Key Rules:**
- Only `label` is always visible (required field)
- Default controls availability (parent gate)
- Child types opt-in individually (isolation)
- Fields start hidden, users explicitly enable what they need

## 6. Player Integration

**Critical:** Individual slides use components from the `ouiispeak` repo in the lesson player.

- The `type` field determines which component to render
- `props_json` is passed to the player component
- Player components are NOT in this CMS repo - they're in the separate `ouiispeak` repo
- CMS only manages the data; player handles rendering

## 7. Field UI Types

Fields have different UI types for rendering:
- `text` - Single-line text input
- `textarea` - Multi-line text input
- `number` - Number input
- `boolean` - Checkbox
- `select` - Dropdown select (requires options)
- `json` - JSON editor (for complex structures)

## 8. Field Categories (for Grouping/Display)

Fields are grouped into logical categories for UI display:
1. Identity & structure (system fields + label)
2. Core content (title, subtitle, body, note)
3. Language & localization
4. Media references
5. Timing & flow
6. Interaction flags
7. Buttons & affordances
8. Authoring metadata
9. Speech & audio interaction
10. Choice & selection
11. Sequencing & grouping
12. Matching / mapping
13. Scoring hints
14. AI / agent behavior hints
15. Visual behavior hints
16. Analytics & observation
17. Freeform / escape hatch

## 9. Data Flow

### Reading Slides
1. Query Supabase `slides` table
2. Map DB row to domain model (`Slide` type)
3. Extract `props_json` → form field values
4. Extract `meta_json` → authoring metadata
5. Combine with DB columns → complete slide data

### Writing Slides
1. Collect form field values
2. Separate into `props_json` (content fields) and `meta_json` (authoring fields)
3. Update DB columns (code, is_activity, score_type, etc.)
4. Save to Supabase `slides` table

## 10. Critical Constraints

1. **Groups are parents of slides** - Always use `group_id`, not `lesson_id` directly
2. **Only `label` is always visible** - Everything else requires opt-in
3. **Default controls availability** - Child types can only use fields Available in Default
4. **Child types are isolated** - Each maintains its own Visible field list
5. **Player components are external** - CMS only manages data, not rendering
6. **88 fields total** - All defined in canonical schema
7. **Storage separation** - `props_json` vs `meta_json` vs DB columns

## 11. What NOT to Include (Avoid These Patterns)

- ❌ localStorage-based preset system (causes override issues)
- ❌ Complex resolver logic with multiple visibility states
- ❌ Backward compatibility with old preset formats
- ❌ Hidden/visible field computation from opposites
- ❌ Code defaults that can be overridden by storage
- ❌ System fields that bypass visibility checks
- ❌ Grouping logic that includes fields not in schema

## 12. What TO Build

- ✅ Single source of truth for field definitions (canonical schema)
- ✅ Simple allowlist model (fields are in or out, no complex states)
- ✅ Clear parent-child relationship (Default → Child Types → Individual Editors)
- ✅ Code defaults that always apply (no storage overrides)
- ✅ Schema-driven rendering (only show fields in schema)
- ✅ Clean separation: availability (Default) vs visibility (Child Types)

---

**Next Steps:**
1. Create new branch for system reset
2. Remove all current slide type editor code
3. Start with Default slide type editor only
4. Build schema-driven allowlist system
5. Add inheritance and capability gating
6. Add child type editors one by one
7. Connect to individual slide editors

