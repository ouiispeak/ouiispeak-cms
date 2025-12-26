# Slide Form System Refactor - Complete Implementation Guide

**Status:** Not Started  
**Created:** [Current Date]  
**Purpose:** Transform hardcoded slide type form logic into a configuration-driven system  
**Critical:** This refactor enables scaling to 60+ slide types and 500+ form fields without code changes

---

## Table of Contents

1. [Purpose & Goals](#purpose--goals)
2. [Current State Analysis](#current-state-analysis)
3. [Target Architecture](#target-architecture)
4. [Implementation Phases](#implementation-phases)
5. [Safety Rules & Guidelines](#safety-rules--guidelines)
6. [Step-by-Step Implementation](#step-by-step-implementation)
7. [Testing Requirements](#testing-requirements)
8. [Rollback Procedures](#rollback-procedures)
9. [Decision Points](#decision-points)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Purpose & Goals

### Why This Refactor Exists

**Problem Statement:**
- Current system has hardcoded form logic for each slide type scattered throughout `app/edit-slide/[slideId]/page.tsx`
- Adding a new slide type requires modifying code in multiple places
- Changing which fields appear for a type requires code changes
- System cannot scale beyond current ~6 types and ~80 fields
- Slide types are immutable after creation (locked in database)

**Goals:**
1. Eliminate all hardcoded slide type conditionals in form rendering
2. Enable configuration-driven form rendering (database-driven)
3. Allow slide types to be modified after creation
4. Support scaling to 60+ types and 500+ fields
5. Zero downtime during migration
6. No data loss or breaking changes

**Success Criteria:**
- ✅ No `if (slideType === "...")` conditionals in form rendering code
- ✅ New slide types can be added via UI without code changes
- ✅ Existing slides continue working throughout migration
- ✅ All validation rules are configuration-driven
- ✅ Master template editor (`/manage-slides`) fully functional

---

## Current State Analysis

### Files Involved

**Primary Files:**
- `app/edit-slide/[slideId]/page.tsx` - Main slide editor (1300+ lines, hardcoded logic)
- `app/group-slides/[groupId]/page.tsx` - Slide creation with type dropdown
- `app/manage-slides/page.tsx` - Currently just redirects (was intended as master template)

**Supporting Files:**
- `lib/data/slides.ts` - Slide data operations
- `components/ui/` - Form components (Input, Textarea, Select, etc.)
- `components/ui/StudentRepeatElementMapper.tsx` - Custom component for ai-speak-student-repeat
- `components/ui/ChoiceElementMapper.tsx` - Custom component for speech-match

### Current Slide Types

1. `text-slide` - Basic text content
2. `title-slide` - Title and subtitle
3. `lesson-end` - Lesson completion message and actions
4. `ai-speak-repeat` - Phrases for TTS repetition
5. `ai-speak-student-repeat` - Student practice elements
6. `speech-match` - Choice elements with audio

### Current Form Fields (Approximate Count: 67-88)

**Identity & Structure Section:**
- Slide ID (read-only)
- Slide Type (read-only)
- Group ID (read-only)
- Group Name (read-only)
- Order Index (read-only)
- Label (required)

**Core Content Section:**
- Title
- Subtitle
- Body
- Lesson End Message (lesson-end only)
- Lesson End Actions (lesson-end only)
- Buttons (JSON)

**Language & Localization:**
- Default Language

**Media Reference:**
- Audio ID

**Speech & Audio Interaction:**
- Phrases (ai-speak-repeat)
- Instructions (ai-speak-student-repeat)
- Prompt Label (ai-speak-student-repeat)
- Elements Array (ai-speak-student-repeat, speech-match)
- Choice Elements (speech-match)
- Note (speech-match)

**Interaction Flags:**
- Is Interactive
- Allow Skip
- Allow Retry
- Is Activity

**Interaction/Flow:**
- On Complete At Index (ai-speak-student-repeat)
- Max Attempts
- Min Attempts Before Skip

**Authoring Metadata:**
- Activity Name

### Current Problems

1. **Hardcoded Conditionals:** 35+ instances of `slideType ===` checks
2. **Duplicate Logic:** Same field rendering logic repeated for different types
3. **No Master Template:** `/manage-slides` was intended but never implemented
4. **Immutable Types:** Cannot change slide type after creation
5. **No Configuration:** All form structure is in code

---

## Target Architecture

### Three-Layer System

```
┌─────────────────────────────────────────┐
│   Layer 1: Field Registry               │
│   - All possible fields defined         │
│   - Field metadata (type, validation)   │
│   - Reusable field definitions          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Layer 2: Slide Type Configuration     │
│   - Maps types to fields                │
│   - Field visibility, order, sections   │
│   - Validation rules per type           │
│   - Stored in database                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   Layer 3: Dynamic Form Renderer        │
│   - Reads config, renders fields        │
│   - No type-specific logic              │
│   - Single renderer for all types       │
└─────────────────────────────────────────┘
```

### Database Schema

**New Tables:**

```sql
-- Field Registry (optional: can be in code initially)
CREATE TABLE slide_field_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id TEXT UNIQUE NOT NULL,  -- e.g., "label", "title", "phrases"
  display_name TEXT NOT NULL,
  field_type TEXT NOT NULL,  -- "text", "textarea", "select", "checkbox", "number", "audio", "complex"
  component_name TEXT,  -- Custom component if needed (e.g., "StudentRepeatElementMapper")
  default_value JSONB,
  validation_schema JSONB,  -- Zod schema or validation rules
  info_tooltip TEXT,
  section_id TEXT,  -- Default section
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Slide Type Configurations (CRITICAL - this is the source of truth)
CREATE TABLE slide_type_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_key TEXT UNIQUE NOT NULL,  -- e.g., "ai-speak-student-repeat"
  display_name TEXT NOT NULL,  -- e.g., "AI Speak Student Repeat"
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  form_config JSONB NOT NULL,  -- Complete form structure (see schema below)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track which config version each slide uses (for migration safety)
ALTER TABLE slides ADD COLUMN IF NOT EXISTS config_version INTEGER;
ALTER TABLE slides ADD COLUMN IF NOT EXISTS config_snapshot JSONB;  -- Optional: snapshot at creation

-- Indexes
CREATE INDEX idx_slide_type_configs_type_key ON slide_type_configs(type_key);
CREATE INDEX idx_slide_type_configs_active ON slide_type_configs(is_active);
```

**Form Config JSONB Schema:**

```typescript
interface FormConfig {
  sections: {
    id: string;
    title: string;
    description?: string;
    order: number;
    backgroundColor?: string;
    borderColor?: string;
  }[];
  fields: {
    fieldId: string;  // References slide_field_registry.field_id
    sectionId: string;  // Which section it belongs to
    order: number;  // Order within section
    required: boolean;
    visible: boolean;
    conditional?: {
      field: string;
      operator: "equals" | "not-equals" | "exists" | "not-exists";
      value: any;
    };
  }[];
  validationRules: {
    fieldId: string;
    rule: string;  // "non-empty", "at-least-one-element", "valid-json", etc.
    message: string;
  }[];
}
```

### Component Structure

**New Components:**

```
components/
  slide-editor/
    DynamicSlideForm.tsx          # Main dynamic form renderer
    FieldRenderer.tsx              # Renders individual fields based on type
    SectionRenderer.tsx            # Renders CmsSection containers
    useSlideTypeConfig.ts          # Hook to fetch config from DB
    useFieldRegistry.ts            # Hook to fetch field definitions
    
  slide-config/
    SlideTypeConfigEditor.tsx     # Master template editor UI
    FieldSelector.tsx              # Visual field selection interface
    ConfigPreview.tsx              # Preview form based on config
    TypeMigrationBuilder.tsx       # Build migration paths between types
```

**New Data Layer:**

```
lib/
  schemas/
    slideFieldRegistry.ts          # Field registry definitions (TypeScript)
    slideTypeConfig.ts             # Config schema and types
    fieldValidation.ts              # Validation rule definitions
    
  data/
    slideTypeConfigs.ts            # CRUD operations for configs
    fieldRegistry.ts               # CRUD operations for field registry
    
  hooks/
    useSlideTypeConfig.ts          # React hook for config
    useFieldRegistry.ts            # React hook for registry
    useTypeMigration.ts            # Hook for type migration
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Set up infrastructure without breaking anything

- [ ] Create database tables
- [ ] Extract field registry from current code
- [ ] Create TypeScript types/interfaces
- [ ] Build data layer functions (CRUD)
- [ ] Create config for ONE test type (proof of concept)

**Exit Criteria:**
- Database tables exist and are tested
- Can create/read/update configs via API
- One slide type config exists in database

### Phase 2: Dynamic Renderer (Weeks 3-4)
**Goal:** Build the form renderer that reads from config

- [ ] Build `DynamicSlideForm` component
- [ ] Build `FieldRenderer` component
- [ ] Build `SectionRenderer` component
- [ ] Create hooks for fetching config
- [ ] Add feature flag system
- [ ] Test with ONE type in parallel (legacy + new)

**Exit Criteria:**
- Dynamic form renders correctly for one type
- Feature flag can toggle between legacy and new
- No regressions in existing functionality

### Phase 3: Master Editor (Weeks 5-6)
**Goal:** Build UI for configuring slide types

- [ ] Build `/manage-slides` configuration UI
- [ ] Create field selector component
- [ ] Create config preview component
- [ ] Add CRUD operations in UI
- [ ] Add validation in UI
- [ ] Test creating new types via UI

**Exit Criteria:**
- Can create/edit slide type configs via UI
- Can preview form before saving
- Configs save correctly to database

### Phase 4: Migration System (Weeks 7-8)
**Goal:** Enable changing slide types after creation

- [ ] Build type migration framework
- [ ] Create migration path definitions
- [ ] Build data transformation logic
- [ ] Add UI for changing slide types
- [ ] Test migrations between types

**Exit Criteria:**
- Can change slide type after creation
- Data transforms correctly
- No data loss during migration

### Phase 5: Gradual Migration (Weeks 9-10)
**Goal:** Migrate existing types one by one

- [ ] Create configs for all 6 existing types
- [ ] Migrate types one by one (with fallback)
- [ ] Monitor for issues
- [ ] Fix bugs as they arise
- [ ] Keep legacy code as fallback

**Exit Criteria:**
- All 6 types have configs
- All types work with new system
- Legacy code still available as fallback

### Phase 6: Cleanup (Weeks 11-12)
**Goal:** Remove legacy code and finalize

- [ ] Remove legacy hardcoded conditionals
- [ ] Remove feature flags
- [ ] Add comprehensive tests
- [ ] Update documentation
- [ ] Performance optimization

**Exit Criteria:**
- No legacy code remains
- All tests pass
- Documentation complete
- Performance acceptable

---

## Safety Rules & Guidelines

### CRITICAL RULES (Never Violate)

1. **Never Delete Data**
   - Never drop columns from `slides` table
   - Never delete existing slide records
   - Always add new columns, never remove old ones (until migration complete)

2. **Always Maintain Backward Compatibility**
   - Legacy code must work until migration is 100% complete
   - Feature flags must allow instant rollback
   - Database changes must be additive only

3. **Incremental Changes Only**
   - One type at a time
   - Test thoroughly before moving to next
   - Never migrate all types at once

4. **Test Before Deploy**
   - Every change must be tested locally
   - Test with real data (copy production data if needed)
   - Test edge cases (empty fields, invalid data, etc.)

5. **Document Everything**
   - Document every decision in this file
   - Update status as you progress
   - Note any deviations from plan

### Code Guidelines

1. **No Hardcoded Type Checks**
   - If you find yourself writing `if (slideType === "...")`, STOP
   - This should be in configuration, not code
   - Exception: Feature flag checks during migration

2. **Configuration is Source of Truth**
   - Form structure comes from database config
   - Validation rules come from config
   - Field visibility comes from config

3. **Single Responsibility**
   - `DynamicSlideForm` only renders (no business logic)
   - Data layer only handles CRUD (no rendering logic)
   - Config layer only manages config (no rendering)

4. **Type Safety**
   - Use TypeScript interfaces for all configs
   - Validate configs with Zod before saving
   - Never use `any` for config data

### Database Guidelines

1. **Migrations Must Be Reversible**
   - Every migration should have a rollback
   - Test rollback before applying migration
   - Keep migration scripts in version control

2. **Additive Schema Changes**
   - Add new columns, don't remove old ones
   - Add new tables, don't drop old ones
   - Use `IF NOT EXISTS` for safety

3. **Data Integrity**
   - Foreign keys where appropriate
   - Unique constraints on type_key
   - Indexes for performance

---

## Step-by-Step Implementation

### Step 1: Database Setup

**File:** Create migration script `docs/migrations/001_create_slide_config_tables.sql`

```sql
-- Step 1.1: Create field registry table
CREATE TABLE IF NOT EXISTS slide_field_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  component_name TEXT,
  default_value JSONB,
  validation_schema JSONB,
  info_tooltip TEXT,
  section_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 1.2: Create slide type configs table
CREATE TABLE IF NOT EXISTS slide_type_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  form_config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 1.3: Add config tracking to slides table
ALTER TABLE slides ADD COLUMN IF NOT EXISTS config_version INTEGER;
ALTER TABLE slides ADD COLUMN IF NOT EXISTS config_snapshot JSONB;

-- Step 1.4: Create indexes
CREATE INDEX IF NOT EXISTS idx_slide_type_configs_type_key ON slide_type_configs(type_key);
CREATE INDEX IF NOT EXISTS idx_slide_type_configs_active ON slide_type_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_slides_config_version ON slides(config_version);

-- Step 1.5: Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('slide_field_registry', 'slide_type_configs');
```

**Verification:**
- Run migration script
- Verify tables exist: `SELECT * FROM slide_type_configs LIMIT 1;`
- Verify columns added: `\d slides` (should show config_version, config_snapshot)

**Rollback (if needed):**
```sql
DROP TABLE IF EXISTS slide_type_configs CASCADE;
DROP TABLE IF EXISTS slide_field_registry CASCADE;
ALTER TABLE slides DROP COLUMN IF EXISTS config_version;
ALTER TABLE slides DROP COLUMN IF EXISTS config_snapshot;
```

---

### Step 2: Extract Field Registry

**File:** `lib/schemas/slideFieldRegistry.ts`

**Process:**
1. Open `app/edit-slide/[slideId]/page.tsx`
2. Identify every `FormField` component
3. Extract field metadata into registry structure
4. Create TypeScript interface for field definition
5. Export registry as array

**Example Structure:**

```typescript
export interface FieldDefinition {
  id: string;
  displayName: string;
  type: "text" | "textarea" | "select" | "checkbox" | "number" | "audio" | "complex";
  componentName?: string;  // e.g., "StudentRepeatElementMapper"
  defaultValue?: any;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;  // Reference to validation function
  };
  infoTooltip?: string;
  defaultSection?: string;
}

export const FIELD_REGISTRY: FieldDefinition[] = [
  {
    id: "label",
    displayName: "Label",
    type: "text",
    validation: { required: true },
    infoTooltip: "Internal name for this slide used in the CMS and navigation.",
    defaultSection: "identity"
  },
  {
    id: "title",
    displayName: "Title",
    type: "text",
    infoTooltip: "Primary heading for the slide.",
    defaultSection: "content"
  },
  // ... continue for all fields
];
```

**Checklist:**
- [ ] All fields from edit-slide page extracted
- [ ] TypeScript interfaces defined
- [ ] Validation rules documented
- [ ] Info tooltips preserved
- [ ] Component names noted for complex fields

---

### Step 3: Create TypeScript Types

**File:** `lib/schemas/slideTypeConfig.ts`

**Create interfaces:**

```typescript
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  backgroundColor?: string;
  borderColor?: string;
}

export interface FormFieldConfig {
  fieldId: string;
  sectionId: string;
  order: number;
  required: boolean;
  visible: boolean;
  conditional?: {
    field: string;
    operator: "equals" | "not-equals" | "exists" | "not-exists";
    value: any;
  };
}

export interface ValidationRule {
  fieldId: string;
  rule: string;  // "non-empty", "at-least-one-element", "valid-json"
  message: string;
}

export interface SlideTypeConfig {
  typeKey: string;
  displayName: string;
  isActive: boolean;
  version: number;
  formConfig: {
    sections: FormSection[];
    fields: FormFieldConfig[];
    validationRules: ValidationRule[];
  };
}
```

**Verification:**
- Types compile without errors
- Can import and use in other files
- Types match database JSONB structure

---

### Step 4: Build Data Layer

**File:** `lib/data/slideTypeConfigs.ts`

**Functions to implement:**

```typescript
// CRUD operations
export async function createSlideTypeConfig(config: SlideTypeConfig): Promise<{ data: SlideTypeConfig | null; error: string | null }>
export async function getSlideTypeConfig(typeKey: string): Promise<{ data: SlideTypeConfig | null; error: string | null }>
export async function updateSlideTypeConfig(typeKey: string, config: Partial<SlideTypeConfig>): Promise<{ data: SlideTypeConfig | null; error: string | null }>
export async function listSlideTypeConfigs(): Promise<{ data: SlideTypeConfig[]; error: string | null }>
export async function deleteSlideTypeConfig(typeKey: string): Promise<{ error: string | null }>

// Helper functions
export async function isConfigActive(typeKey: string): Promise<boolean>
export async function getLatestConfigVersion(typeKey: string): Promise<number>
```

**Pattern to follow:**
- Use same pattern as `lib/data/slides.ts`
- Return `{ data, error }` structure
- Use Supabase client from `lib/supabase.ts`
- Handle errors gracefully

**Testing:**
- Test each function with real database
- Test error cases (missing config, invalid data)
- Verify data integrity

---

### Step 5: Create First Config (Proof of Concept)

**Choose simplest type:** `text-slide` (fewest fields)

**Process:**
1. Identify all fields used by `text-slide` in current code
2. Map fields to sections
3. Define validation rules
4. Create config JSON
5. Insert into database via data layer function

**Example Config:**

```typescript
const textSlideConfig: SlideTypeConfig = {
  typeKey: "text-slide",
  displayName: "Text Slide",
  isActive: true,
  version: 1,
  formConfig: {
    sections: [
      {
        id: "identity",
        title: "Identity & Structure",
        order: 1,
        backgroundColor: "#e6f1f1",
        borderColor: "#b4d5d5"
      },
      {
        id: "content",
        title: "Core Content",
        order: 2,
        backgroundColor: "#e6f1f1",
        borderColor: "#b4d5d5"
      }
    ],
    fields: [
      {
        fieldId: "label",
        sectionId: "identity",
        order: 1,
        required: true,
        visible: true
      },
      {
        fieldId: "title",
        sectionId: "content",
        order: 1,
        required: false,
        visible: true
      },
      // ... continue
    ],
    validationRules: [
      {
        fieldId: "label",
        rule: "non-empty",
        message: "Label is required"
      }
    ]
  }
};
```

**Verification:**
- Config saved to database
- Can retrieve config via `getSlideTypeConfig("text-slide")`
- Config structure matches TypeScript types

---

### Step 6: Build Dynamic Form Renderer

**File:** `components/slide-editor/DynamicSlideForm.tsx`

**Process:**
1. Create component that accepts `slideType` and `values`
2. Fetch config using hook
3. Group fields by section
4. Render sections and fields dynamically
5. Handle field value changes

**Structure:**

```typescript
export function DynamicSlideForm({
  slideType,
  values,
  onChange,
  onSave
}: {
  slideType: string;
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  onSave: () => void;
}) {
  const { config, loading, error } = useSlideTypeConfig(slideType);
  
  if (loading) return <div>Loading form...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!config) return <div>No configuration found</div>;
  
  // Group fields by section
  const sectionsWithFields = groupFieldsBySection(config.formConfig);
  
  return (
    <form onSubmit={onSave}>
      {sectionsWithFields.map(section => (
        <SectionRenderer
          key={section.id}
          section={section.section}
          fields={section.fields}
          values={values}
          onChange={onChange}
        />
      ))}
    </form>
  );
}
```

**Dependencies to build:**
- `useSlideTypeConfig` hook
- `SectionRenderer` component
- `FieldRenderer` component
- `groupFieldsBySection` utility

**Verification:**
- Component renders without errors
- Fields appear in correct sections
- Values can be changed
- Form submission works

---

### Step 7: Build Field Renderer

**File:** `components/slide-editor/FieldRenderer.tsx`

**Process:**
1. Accept field config and value
2. Look up field definition from registry
3. Render appropriate component based on field type
4. Handle complex components (StudentRepeatElementMapper, etc.)

**Structure:**

```typescript
export function FieldRenderer({
  fieldConfig,
  fieldDefinition,
  value,
  onChange
}: {
  fieldConfig: FormFieldConfig;
  fieldDefinition: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
}) {
  // Handle complex components
  if (fieldDefinition.componentName === "StudentRepeatElementMapper") {
    return <StudentRepeatElementMapper ... />;
  }
  
  // Handle standard field types
  switch (fieldDefinition.type) {
    case "text":
      return <Input value={value} onChange={onChange} />;
    case "textarea":
      return <Textarea value={value} onChange={onChange} />;
    // ... etc
  }
}
```

**Verification:**
- All field types render correctly
- Complex components work
- Value changes propagate correctly

---

### Step 8: Add Feature Flag System

**File:** `lib/config/featureFlags.ts`

**Purpose:** Allow gradual rollout and instant rollback

**Structure:**

```typescript
export const FEATURE_FLAGS = {
  USE_DYNAMIC_SLIDE_FORM: process.env.NEXT_PUBLIC_USE_DYNAMIC_FORM === "true",
  DYNAMIC_FORM_TYPES: (process.env.NEXT_PUBLIC_DYNAMIC_FORM_TYPES || "").split(",").filter(Boolean)
};

export function shouldUseDynamicForm(slideType: string): boolean {
  if (!FEATURE_FLAGS.USE_DYNAMIC_SLIDE_FORM) return false;
  if (FEATURE_FLAGS.DYNAMIC_FORM_TYPES.length === 0) return true;
  return FEATURE_FLAGS.DYNAMIC_FORM_TYPES.includes(slideType);
}
```

**Usage in edit-slide page:**

```typescript
if (shouldUseDynamicForm(slideType)) {
  return <DynamicSlideForm ... />;
} else {
  return <LegacySlideForm ... />;  // Existing hardcoded form
}
```

**Environment Variables:**
```bash
# .env.local
NEXT_PUBLIC_USE_DYNAMIC_FORM=false
NEXT_PUBLIC_DYNAMIC_FORM_TYPES=text-slide
```

**Verification:**
- Feature flag controls which form renders
- Can toggle on/off without code changes
- Can enable for specific types only

---

### Step 9: Test with One Type

**Process:**
1. Enable feature flag for `text-slide` only
2. Create test slide of type `text-slide`
3. Edit slide - should use dynamic form
4. Verify all fields render correctly
5. Verify values save correctly
6. Compare with legacy form behavior

**Checklist:**
- [ ] Dynamic form renders for text-slide
- [ ] All fields visible and editable
- [ ] Values save to database correctly
- [ ] No regressions in functionality
- [ ] Can toggle back to legacy form

---

### Step 10: Build Master Configuration UI

**File:** `app/manage-slides/page.tsx` (replace redirect)

**Components needed:**
- `SlideTypeConfigEditor` - Main editor
- `FieldSelector` - Visual field selection
- `ConfigPreview` - Live preview
- `SectionEditor` - Section management

**Features:**
1. Select slide type from dropdown
2. Visual field selector (checkboxes)
3. Drag-and-drop field ordering
4. Section assignment
5. Required/optional toggles
6. Live preview
7. Save configuration

**UI Flow:**
```
[Select Type: text-slide ▼]
┌─────────────────────────────┐
│ Available Fields             │
│ ☑ Label (required)          │
│ ☑ Title                      │
│ ☐ Subtitle                   │
│ ☑ Body                       │
│ ...                          │
└─────────────────────────────┘
         ↓
┌─────────────────────────────┐
│ Preview                      │
│ [Identity & Structure]      │
│ Label: [________] *         │
│ [Core Content]              │
│ Title: [________]           │
│ Body: [________]            │
└─────────────────────────────┘
[Save Configuration]
```

**Verification:**
- Can select slide type
- Can toggle field visibility
- Can reorder fields
- Preview updates in real-time
- Config saves to database
- Saved config works in edit-slide

---

### Step 11: Create Configs for All Types

**Process:**
1. For each remaining type (title-slide, lesson-end, etc.):
   - Identify all fields used
   - Map to sections
   - Define validation rules
   - Create config JSON
   - Insert into database
2. Test each config in master editor
3. Verify each type works with dynamic form

**Order of Migration:**
1. text-slide (simplest) ✅
2. title-slide
3. lesson-end
4. ai-speak-repeat
5. ai-speak-student-repeat
6. speech-match (most complex)

**Verification:**
- All 6 types have configs
- All configs validated
- All types work with dynamic form

---

### Step 12: Build Type Migration System

**File:** `lib/data/typeMigrations.ts`

**Purpose:** Allow changing slide type after creation

**Structure:**

```typescript
export interface TypeMigration {
  fromType: string;
  toType: string;
  fieldMapping: {
    [oldFieldId: string]: string | ((value: any) => any);
  };
  dataTransformation?: (oldData: any) => any;
}

export const TYPE_MIGRATIONS: TypeMigration[] = [
  {
    fromType: "text-slide",
    toType: "title-slide",
    fieldMapping: {
      "title": "title",  // Direct mapping
      "body": null,  // Remove field
      "subtitle": "subtitle"
    }
  },
  // ... more migrations
];

export async function migrateSlideType(
  slideId: string,
  newType: string
): Promise<{ error: string | null }> {
  // Load slide
  // Find migration path
  // Transform data
  // Update slide
}
```

**UI Integration:**
- Add "Change Type" button in edit-slide
- Show migration preview
- Confirm before migrating
- Show warnings if data might be lost

**Verification:**
- Can change slide type
- Data transforms correctly
- No data loss
- Validation passes after migration

---

### Step 13: Gradual Migration

**Process:**
1. Enable dynamic form for one type at a time
2. Monitor for issues
3. Fix bugs as they arise
4. Move to next type only after current is stable

**Migration Order:**
1. text-slide (already done)
2. title-slide
3. lesson-end
4. ai-speak-repeat
5. ai-speak-student-repeat
6. speech-match

**For Each Type:**
- [ ] Enable feature flag
- [ ] Test with existing slides
- [ ] Fix any bugs
- [ ] Verify no regressions
- [ ] Move to next type

---

### Step 14: Remove Legacy Code

**Only after all types migrated and stable**

**Process:**
1. Remove feature flag checks
2. Remove legacy form rendering code
3. Remove hardcoded conditionals
4. Clean up unused imports
5. Update documentation

**Files to clean:**
- `app/edit-slide/[slideId]/page.tsx` - Remove all hardcoded logic
- Remove `LegacySlideForm` component if created
- Remove feature flag system

**Verification:**
- No `slideType ===` conditionals remain
- All types use dynamic form
- Tests pass
- No regressions

---

## Testing Requirements

### Unit Tests

**Files to test:**
- `lib/data/slideTypeConfigs.ts` - All CRUD operations
- `lib/schemas/slideFieldRegistry.ts` - Field definitions
- `components/slide-editor/DynamicSlideForm.tsx` - Form rendering
- `components/slide-editor/FieldRenderer.tsx` - Field rendering

**Test cases:**
- Config CRUD operations
- Field registry lookups
- Form rendering with various configs
- Field value updates
- Validation rules

### Integration Tests

**Test scenarios:**
1. Create slide type config via UI
2. Edit slide using dynamic form
3. Save changes
4. Reload slide - changes persist
5. Change slide type
6. Verify data migration

### Manual Testing Checklist

**For each slide type:**
- [ ] Create new slide of this type
- [ ] Edit slide - all fields visible
- [ ] Fill in all fields
- [ ] Save - no errors
- [ ] Reload - values persist
- [ ] Change values - save works
- [ ] Validation works (required fields, etc.)
- [ ] Change slide type - migration works

**Edge cases:**
- [ ] Empty form submission
- [ ] Invalid data entry
- [ ] Missing config (should fallback gracefully)
- [ ] Database connection failure
- [ ] Concurrent edits

---

## Rollback Procedures

### If Something Breaks

**Immediate Actions:**
1. **Disable feature flag:**
   ```bash
   # .env.local
   NEXT_PUBLIC_USE_DYNAMIC_FORM=false
   ```
2. **Restart application** - All slides revert to legacy form
3. **Investigate issue** - Check logs, database, etc.
4. **Fix issue** - Make necessary corrections
5. **Re-enable gradually** - Test thoroughly before re-enabling

### Database Rollback

**If database changes need reversal:**

```sql
-- Rollback Step 1: Disable configs
UPDATE slide_type_configs SET is_active = false;

-- Rollback Step 2: Remove config tracking (if needed)
-- ALTER TABLE slides DROP COLUMN IF EXISTS config_version;
-- ALTER TABLE slides DROP COLUMN IF EXISTS config_snapshot;

-- Rollback Step 3: Drop tables (LAST RESORT - only if absolutely necessary)
-- DROP TABLE IF EXISTS slide_type_configs CASCADE;
-- DROP TABLE IF EXISTS slide_field_registry CASCADE;
```

**Warning:** Only drop tables if you're certain you want to start over. Data in these tables can be valuable.

### Code Rollback

**If code changes need reversal:**
1. Revert to previous git commit
2. Or comment out new code, uncomment legacy code
3. Feature flag system makes this easy

---

## Decision Points

### Decision 1: Field Registry Location

**Options:**
- A) In database (flexible, requires UI)
- B) In code (type-safe, version-controlled)

**Decision:** Start with B (code), migrate to A later if needed

**Rationale:** Easier to start, can migrate later. Code provides type safety.

---

### Decision 2: Configuration Storage

**Options:**
- A) Database only
- B) Code + Database (code as fallback)

**Decision:** A (Database only)

**Rationale:** Database is source of truth. Code fallback adds complexity.

---

### Decision 3: Migration Strategy

**Options:**
- A) Big bang (all at once)
- B) Gradual (one type at a time)

**Decision:** B (Gradual)

**Rationale:** Safer, allows testing, can rollback individual types.

---

### Decision 4: Feature Flag System

**Options:**
- A) Environment variables
- B) Database flags
- C) Both

**Decision:** A (Environment variables)

**Rationale:** Simple, instant rollback, no database dependency.

---

## Troubleshooting Guide

### Problem: Dynamic form doesn't render

**Symptoms:** Blank screen or error message

**Checklist:**
1. Is feature flag enabled? `NEXT_PUBLIC_USE_DYNAMIC_FORM=true`
2. Is slide type in allowed list? `NEXT_PUBLIC_DYNAMIC_FORM_TYPES`
3. Does config exist in database? Check `slide_type_configs` table
4. Are there JavaScript errors? Check browser console
5. Is hook working? Check `useSlideTypeConfig` hook

**Solutions:**
- Enable feature flag
- Add type to allowed list
- Create config for slide type
- Fix JavaScript errors
- Debug hook

---

### Problem: Fields not appearing

**Symptoms:** Form renders but fields missing

**Checklist:**
1. Are fields marked as `visible: true` in config?
2. Are fields assigned to sections?
3. Are sections included in config?
4. Is field registry complete?

**Solutions:**
- Check config JSONB in database
- Verify field visibility settings
- Ensure sections are defined
- Add missing fields to registry

---

### Problem: Values not saving

**Symptoms:** Changes don't persist

**Checklist:**
1. Is `onChange` handler working?
2. Is `handleSave` calling update function?
3. Are database updates succeeding?
4. Are there validation errors?

**Solutions:**
- Debug onChange handler
- Check handleSave function
- Verify database updates
- Fix validation errors

---

### Problem: Migration fails

**Symptoms:** Can't change slide type

**Checklist:**
1. Does migration path exist?
2. Is data transformation working?
3. Are there validation errors?
4. Is database connection stable?

**Solutions:**
- Create migration path
- Fix data transformation
- Resolve validation errors
- Check database connection

---

## Current Status Tracking

**Update this section as you progress:**

### Phase 1: Foundation
- [ ] Database tables created
- [ ] Field registry extracted
- [ ] TypeScript types created
- [ ] Data layer functions built
- [ ] First config created (text-slide)

### Phase 2: Dynamic Renderer
- [ ] DynamicSlideForm component built
- [ ] FieldRenderer component built
- [ ] SectionRenderer component built
- [ ] Hooks created
- [ ] Feature flag system added
- [ ] Tested with one type

### Phase 3: Master Editor
- [ ] Configuration UI built
- [ ] Field selector working
- [ ] Config preview working
- [ ] CRUD operations working
- [ ] Can create types via UI

### Phase 4: Migration System
- [ ] Migration framework built
- [ ] Migration paths defined
- [ ] Data transformation working
- [ ] UI for changing types
- [ ] Tested migrations

### Phase 5: Gradual Migration
- [ ] text-slide migrated
- [ ] title-slide migrated
- [ ] lesson-end migrated
- [ ] ai-speak-repeat migrated
- [ ] ai-speak-student-repeat migrated
- [ ] speech-match migrated

### Phase 6: Cleanup
- [ ] Legacy code removed
- [ ] Feature flags removed
- [ ] Tests added
- [ ] Documentation updated
- [ ] Performance optimized

---

## Notes & Deviations

**Use this section to document:**
- Decisions made during implementation
- Deviations from plan
- Issues encountered
- Solutions found
- Lessons learned

---

## Emergency Contacts & Resources

**If stuck:**
1. Review this document thoroughly
2. Check git history for similar issues
3. Review test files for examples
4. Check database directly: `SELECT * FROM slide_type_configs;`

**Key Files Reference:**
- Current editor: `app/edit-slide/[slideId]/page.tsx`
- Slide creation: `app/group-slides/[groupId]/page.tsx`
- Data layer: `lib/data/slides.ts`
- Database: Check Supabase dashboard

---

**END OF DOCUMENT**

*This document should be updated as implementation progresses. Never delete this document - it's your safety net.*

