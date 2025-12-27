# CMS Integration Migration Plan
## Transitioning OuiiSpeak Player from Hardcoded to CMS

**Goal:** Transition the OuiiSpeak player application from hardcoded content to full CMS integration while maintaining the ability to rollback if needed.

**Approach:** Phased migration with feature flags, parallel systems, and comprehensive testing at each stage.

---

## 📋 Pre-Migration Checklist

### Phase 0: Preparation

#### 1. **Inventory Current System**
- [ ] Document all hardcoded lesson files and their locations
- [ ] List all slide types currently in use
- [ ] Identify all data structures and formats
- [ ] Map hardcoded lesson IDs to CMS lesson IDs
- [ ] Document any custom logic or transformations

#### 2. **Set Up Archive Structure**
```bash
# In ouiispeak repo, create archive structure:
archive/
├── hardcoded-lessons/          # Original lesson files
├── hardcoded-components/       # Original components (if replaced)
├── hardcoded-types/            # Original type definitions
└── migration-notes/            # Migration documentation
```

#### 3. **Create Feature Flag System**
- [ ] Add feature flag: `USE_CMS_CONTENT` (default: false)
- [ ] Add feature flag: `CMS_API_URL` (points to CMS API)
- [ ] Add feature flag: `FALLBACK_TO_HARDCODED` (default: true)

#### 4. **Verify CMS API Endpoints**
- [ ] Test `GET /api/v1/lessons/[lessonId]`
- [ ] Test `GET /api/v1/lessons/[lessonId]/slides`
- [ ] Test `GET /api/v1/lessons/[lessonId]/groups`
- [ ] Verify CORS is configured correctly
- [ ] Test authentication (if needed)

---

## 🔄 Migration Phases

### Phase 1: Data Layer Integration (Low Risk)

**Goal:** Create CMS data access layer without changing UI

#### Step 1.1: Create CMS Data Access Module
**Files to create:**
- `src/lib/cms/dataAccess.ts` - CMS API client
- `src/lib/cms/types.ts` - CMS type definitions
- `src/lib/cms/mappers.ts` - Map CMS data to player format

**Implementation:**
```typescript
// src/lib/cms/dataAccess.ts
export class CmsDataAccess {
  constructor(private apiUrl: string) {}
  
  async getLesson(lessonId: string): Promise<Lesson> {
    // Fetch from CMS API
    // Transform to player format
  }
  
  async getSlides(lessonId: string): Promise<Slide[]> {
    // Fetch from CMS API
    // Transform to player format
  }
}
```

#### Step 1.2: Create Data Transformation Layer
**Critical transformations needed:**
1. **Language Code Mapping**
   - CMS: `"english"` / `"french"` / `"both"`
   - Player: `"en"` / `"fr"` / `"both"`
   - Solution: Create mapping function

2. **File URL Format**
   - CMS: Full Supabase URL
   - Player: May expect relative paths
   - Solution: Extract path or verify player can handle URLs

3. **Optional Fields**
   - CMS: Always includes `referenceText` and `speech`
   - Player: These are optional
   - Solution: Keep as-is (backward compatible)

#### Step 1.3: Test Data Layer
- [ ] Unit tests for data access
- [ ] Unit tests for transformations
- [ ] Integration test: Fetch real lesson from CMS
- [ ] Verify data structure matches player expectations

**Success Criteria:**
- ✅ Can fetch lesson data from CMS API
- ✅ Data transformations work correctly
- ✅ All tests pass

---

### Phase 2: Parallel System (Medium Risk)

**Goal:** Run both systems side-by-side with feature flag

#### Step 2.1: Create Unified Data Loader
**File:** `src/lib/lessons/lessonLoader.ts`

```typescript
export async function loadLesson(lessonId: string): Promise<Lesson> {
  if (featureFlags.USE_CMS_CONTENT) {
    try {
      return await cmsDataAccess.getLesson(lessonId);
    } catch (error) {
      if (featureFlags.FALLBACK_TO_HARDCODED) {
        console.warn('CMS fetch failed, falling back to hardcoded');
        return loadHardcodedLesson(lessonId);
      }
      throw error;
    }
  }
  return loadHardcodedLesson(lessonId);
}
```

#### Step 2.2: Archive Hardcoded System
- [ ] Move hardcoded lesson files to `archive/hardcoded-lessons/`
- [ ] Update imports to use archived location
- [ ] Create `loadHardcodedLesson()` wrapper function
- [ ] Add deprecation warnings

#### Step 2.3: Update Lesson Loading Points
**Files to update:**
- Lesson routing/loading logic
- Lesson preview components
- Any direct imports of hardcoded lessons

**Pattern:**
```typescript
// Before:
import { A0Module1Lesson1 } from '@/data/lessons/A0Module1Lesson1';

// After:
import { loadLesson } from '@/lib/lessons/lessonLoader';
const lesson = await loadLesson('lesson-id');
```

#### Step 2.4: Test Parallel System
- [ ] Test with `USE_CMS_CONTENT = false` (hardcoded)
- [ ] Test with `USE_CMS_CONTENT = true` (CMS)
- [ ] Test fallback when CMS fails
- [ ] Verify UI works identically in both modes

**Success Criteria:**
- ✅ Both systems work independently
- ✅ Feature flag switches between them
- ✅ Fallback works correctly
- ✅ No UI changes visible to users

---

### Phase 3: Component Updates (Medium Risk)

**Goal:** Update components to handle CMS data format

#### Step 3.1: Identify Components Needing Updates
**Components to check:**
- Slide renderers (all slide types)
- Audio loading components
- TTS components
- Assessment submission components

#### Step 3.2: Update Slide Components
**Key changes:**
1. **Language Code Handling**
   - Ensure components accept both formats
   - Or normalize in data layer

2. **File URL Handling**
   - Verify audio loading works with Supabase URLs
   - Or transform URLs in data layer

3. **Optional Fields**
   - Ensure components handle optional `referenceText` and `speech`
   - (CMS always provides them, so this should be fine)

#### Step 3.3: Test Each Slide Type
- [ ] Text slide
- [ ] Title slide
- [ ] Lesson-end slide
- [ ] AI-speak-repeat slide
- [ ] AI-speak-student-repeat slide
- [ ] Speech-match slide

**Success Criteria:**
- ✅ All slide types render correctly with CMS data
- ✅ Audio files load correctly
- ✅ TTS works correctly
- ✅ Assessments submit correctly

---

### Phase 4: Gradual Rollout (Low Risk)

**Goal:** Enable CMS for specific lessons, then expand

#### Step 4.1: Enable CMS for One Lesson
- [ ] Choose a test lesson (e.g., A0 Module 1 Lesson 1)
- [ ] Set feature flag: `USE_CMS_LESSONS = ['lesson-id']`
- [ ] Test thoroughly
- [ ] Verify all functionality works

#### Step 4.2: Expand to One Module
- [ ] Enable CMS for all lessons in one module
- [ ] Test module navigation
- [ ] Test lesson progression
- [ ] Monitor for errors

#### Step 4.3: Expand to All Lessons
- [ ] Enable CMS globally: `USE_CMS_CONTENT = true`
- [ ] Keep fallback enabled: `FALLBACK_TO_HARDCODED = true`
- [ ] Monitor for issues
- [ ] Collect user feedback

**Success Criteria:**
- ✅ All lessons load from CMS
- ✅ No critical errors
- ✅ Performance is acceptable
- ✅ User experience is unchanged or improved

---

### Phase 5: Cleanup (Low Risk)

**Goal:** Remove hardcoded system after successful migration

#### Step 5.1: Verify Success
- [ ] CMS has been stable for X days/weeks
- [ ] No critical bugs reported
- [ ] Performance metrics are good
- [ ] User feedback is positive

#### Step 5.2: Remove Hardcoded System
- [ ] Remove hardcoded lesson files (keep in archive)
- [ ] Remove `loadHardcodedLesson()` function
- [ ] Remove feature flags
- [ ] Update documentation

#### Step 5.3: Final Cleanup
- [ ] Remove unused imports
- [ ] Update README
- [ ] Archive migration documentation

**Success Criteria:**
- ✅ Codebase only uses CMS
- ✅ Archive is complete
- ✅ Documentation is updated
- ✅ No broken references

---

## 🔧 Technical Implementation Details

### Data Transformation Functions

#### Language Code Mapping
```typescript
// src/lib/cms/mappers.ts
export function mapCmsLanguageToPlayer(cmsLang: string): string {
  const langMap: Record<string, string> = {
    'english': 'en',
    'french': 'fr',
    'both': 'both',
  };
  return langMap[cmsLang.toLowerCase()] || 'en';
}
```

#### File URL Transformation
```typescript
// Option 1: Extract relative path from Supabase URL
export function extractPathFromUrl(url: string): string {
  // Extract: /storage/v1/object/public/lesson-audio/path/to/file.wav
  // Return: /audio/path/to/file.wav (or whatever format player expects)
}

// Option 2: Keep full URL (if player supports it)
export function normalizeFileUrl(url: string): string {
  return url; // Keep as-is if player can handle Supabase URLs
}
```

### Feature Flag Implementation
```typescript
// src/lib/config/featureFlags.ts
export const featureFlags = {
  USE_CMS_CONTENT: process.env.NEXT_PUBLIC_USE_CMS_CONTENT === 'true',
  CMS_API_URL: process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:3000',
  FALLBACK_TO_HARDCODED: process.env.NEXT_PUBLIC_FALLBACK_TO_HARDCODED !== 'false',
  CMS_LESSON_IDS: process.env.NEXT_PUBLIC_CMS_LESSON_IDS?.split(',') || [],
};
```

### Error Handling Strategy
```typescript
// src/lib/lessons/lessonLoader.ts
export async function loadLesson(lessonId: string): Promise<Lesson> {
  if (shouldUseCms(lessonId)) {
    try {
      return await cmsDataAccess.getLesson(lessonId);
    } catch (error) {
      logger.error('CMS fetch failed', { lessonId, error });
      
      if (featureFlags.FALLBACK_TO_HARDCODED) {
        logger.warn('Falling back to hardcoded lesson', { lessonId });
        return loadHardcodedLesson(lessonId);
      }
      
      throw new Error(`Failed to load lesson ${lessonId} from CMS`);
    }
  }
  
  return loadHardcodedLesson(lessonId);
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Data access layer tests
- [ ] Transformation function tests
- [ ] Feature flag logic tests
- [ ] Error handling tests

### Integration Tests
- [ ] CMS API integration tests
- [ ] Fallback mechanism tests
- [ ] End-to-end lesson loading tests

### Manual Testing Checklist
- [ ] Load lesson from CMS
- [ ] Verify all slides render correctly
- [ ] Test audio playback
- [ ] Test TTS functionality
- [ ] Test assessment submission
- [ ] Test lesson navigation
- [ ] Test module navigation
- [ ] Test error scenarios (CMS down, invalid lesson ID, etc.)

---

## 📊 Success Metrics

### Performance Metrics
- [ ] Lesson load time < X seconds
- [ ] Slide render time < X milliseconds
- [ ] API response time < X milliseconds

### Reliability Metrics
- [ ] CMS availability > 99%
- [ ] Fallback success rate > 95%
- [ ] Error rate < 1%

### User Experience Metrics
- [ ] No visible changes to users
- [ ] No increase in bugs
- [ ] No performance degradation

---

## 🚨 Rollback Plan

### Immediate Rollback (Feature Flag)
```typescript
// Set in .env.local:
NEXT_PUBLIC_USE_CMS_CONTENT=false
```
- Instant rollback to hardcoded system
- No code changes needed
- No deployment needed

### Code Rollback (If Needed)
1. Revert to previous git commit
2. Restore hardcoded files from archive
3. Remove CMS integration code
4. Deploy previous version

### Data Rollback (If Needed)
- Hardcoded lessons remain in archive
- Can restore at any time
- No data loss

---

## 📝 Migration Checklist

### Pre-Migration
- [ ] Complete Phase 0 checklist
- [ ] Set up archive structure
- [ ] Create feature flag system
- [ ] Verify CMS API endpoints

### Phase 1: Data Layer
- [ ] Create CMS data access module
- [ ] Create transformation layer
- [ ] Test data layer
- [ ] Document transformations

### Phase 2: Parallel System
- [ ] Create unified loader
- [ ] Archive hardcoded system
- [ ] Update loading points
- [ ] Test parallel system

### Phase 3: Component Updates
- [ ] Identify components to update
- [ ] Update slide components
- [ ] Test each slide type
- [ ] Fix any issues

### Phase 4: Gradual Rollout
- [ ] Enable CMS for one lesson
- [ ] Expand to one module
- [ ] Expand to all lessons
- [ ] Monitor and fix issues

### Phase 5: Cleanup
- [ ] Verify success metrics
- [ ] Remove hardcoded system
- [ ] Final cleanup
- [ ] Update documentation

---

## 🎯 Recommended Order

1. **Start with Phase 1** (Data Layer) - Lowest risk, foundation for everything
2. **Then Phase 2** (Parallel System) - Allows testing without breaking anything
3. **Then Phase 3** (Component Updates) - Fix any format mismatches
4. **Then Phase 4** (Gradual Rollout) - Safe, incremental deployment
5. **Finally Phase 5** (Cleanup) - Only after proven success

---

## 💡 Key Considerations

### Known Issues to Address
1. **Language Code Format** - Must map CMS format to player format
2. **File URL Format** - Verify player can handle Supabase URLs
3. **Optional Fields** - CMS always provides them, should be fine

### Risk Mitigation
- Feature flags allow instant rollback
- Parallel system allows gradual migration
- Archive preserves original system
- Comprehensive testing at each phase

### Timeline Estimate
- **Phase 1:** 1-2 days
- **Phase 2:** 2-3 days
- **Phase 3:** 3-5 days
- **Phase 4:** 1-2 weeks (gradual rollout)
- **Phase 5:** 1 day (after success)

**Total:** ~3-4 weeks for complete migration

---

## 📚 Additional Resources

- CMS API Documentation: See `docs/TIER_IMPLEMENTATION_COMPLETE.md`
- Hardcoded vs CMS Comparison: See `HARDCODED_VS_CMS_FINDINGS.md`
- CMS API Endpoints: `/api/v1/lessons/[lessonId]`, `/slides`, `/groups`

---

**Last Updated:** December 2024  
**Status:** Ready to begin Phase 1

