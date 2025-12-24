/**
 * Quick Sanity Check Script
 * 
 * Run this in the browser console on any CMS page to verify the slide system hierarchy.
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 
 * The script will output test results to the console.
 */

(async () => {
  console.log('🧪 Starting Slide System Hierarchy Sanity Check...\n');
  
  try {
    // Import the registry module
    const registry = await import('/lib/slide-editor-registry/index.ts');
    const { getSlideEditorDefinition, getVisibleSchemaForType, DEFAULT_SLIDE_FIELDS } = registry;
    
    // Test 1: Verify no schema in SlideEditorDefinition
    console.log('Test 1: Checking SlideEditorDefinition structure...');
    const aiSpeakDef = getSlideEditorDefinition('ai-speak-repeat');
    const hasSchema = 'schema' in aiSpeakDef;
    console.log(`  ${hasSchema ? '❌ FAIL' : '✅ PASS'}: SlideEditorDefinition has schema property: ${hasSchema}`);
    console.log(`  Definition keys:`, Object.keys(aiSpeakDef));
    
    // Test 2: Verify getVisibleSchemaForType works
    console.log('\nTest 2: Checking getVisibleSchemaForType()...');
    const defaultSchema = getVisibleSchemaForType('default');
    const aiSpeakSchema = getVisibleSchemaForType('ai-speak-repeat');
    console.log(`  ✅ Default schema fields: ${defaultSchema.fields.length}`);
    console.log(`  ✅ AI Speak Repeat schema fields: ${aiSpeakSchema.fields.length}`);
    console.log(`  Default visible fields:`, defaultSchema.fields.slice(0, 5).map(f => f.key).join(', '), '...');
    console.log(`  AI Speak visible fields:`, aiSpeakSchema.fields.slice(0, 5).map(f => f.key).join(', '), '...');
    
    // Test 3: Verify non-propagating visibility
    console.log('\nTest 3: Checking non-propagating visibility...');
    const defaultVisibleKeys = new Set(defaultSchema.fields.map(f => f.key));
    const aiSpeakVisibleKeys = new Set(aiSpeakSchema.fields.map(f => f.key));
    const allFieldKeys = new Set(DEFAULT_SLIDE_FIELDS.map(f => f.key));
    
    // Check if ai-speak-repeat has fields that default doesn't have (shouldn't happen)
    const aiSpeakOnly = [...aiSpeakVisibleKeys].filter(k => !defaultVisibleKeys.has(k));
    console.log(`  ${aiSpeakOnly.length > 0 ? '❌ FAIL' : '✅ PASS'}: AI Speak has fields not in Default: ${aiSpeakOnly.length}`);
    
    // Check if default has fields that ai-speak-repeat doesn't (expected - non-propagating)
    const defaultOnly = [...defaultVisibleKeys].filter(k => !aiSpeakVisibleKeys.has(k));
    console.log(`  ✅ Expected: Default has ${defaultOnly.length} fields not visible in AI Speak (non-propagating)`);
    
    // Test 4: Check localStorage preset format
    console.log('\nTest 4: Checking localStorage preset format...');
    const presetsJson = localStorage.getItem('slideTypePresets');
    if (presetsJson) {
      const presets = JSON.parse(presetsJson);
      const aiSpeakPreset = presets.presets?.['ai-speak-repeat'];
      const defaultPreset = presets.presets?.default;
      
      if (aiSpeakPreset) {
        const hasVisibleKeys = 'visibleFieldKeys' in aiSpeakPreset;
        const hasHiddenKeys = 'hiddenFieldKeys' in aiSpeakPreset;
        console.log(`  ✅ AI Speak preset has visibleFieldKeys: ${hasVisibleKeys}`);
        console.log(`  ✅ AI Speak preset has hiddenFieldKeys: ${hasHiddenKeys}`);
        if (hasVisibleKeys) {
          console.log(`  ✅ AI Speak visibleFieldKeys count: ${aiSpeakPreset.visibleFieldKeys?.length || 0}`);
        }
      }
      
      if (defaultPreset) {
        const hasHiddenKeys = 'hiddenFieldKeys' in defaultPreset;
        console.log(`  ✅ Default preset has hiddenFieldKeys: ${hasHiddenKeys}`);
        console.log(`  ✅ Default hiddenFieldKeys count: ${defaultPreset.hiddenFieldKeys?.length || 0}`);
      }
    } else {
      console.log('  ⚠️  No presets in localStorage (using code defaults)');
    }
    
    // Test 5: Verify all slide types work
    console.log('\nTest 5: Checking all registered slide types...');
    const allTypes = ['default', 'ai-speak-repeat', 'text-slide', 'title-slide'];
    let allPass = true;
    for (const type of allTypes) {
      try {
        const def = getSlideEditorDefinition(type);
        const schema = getVisibleSchemaForType(type);
        const hasSchema = 'schema' in def;
        if (hasSchema) {
          console.log(`  ❌ FAIL: ${type} definition has schema property`);
          allPass = false;
        } else {
          console.log(`  ✅ ${type}: ${schema.fields.length} visible fields`);
        }
      } catch (e) {
        console.log(`  ❌ FAIL: ${type} - ${e.message}`);
        allPass = false;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    if (allPass && !hasSchema) {
      console.log('✅ ALL TESTS PASSED - Slide system hierarchy is working correctly!');
    } else {
      console.log('❌ SOME TESTS FAILED - Check the output above');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error running sanity check:', error);
    console.error('Stack:', error.stack);
  }
})();

