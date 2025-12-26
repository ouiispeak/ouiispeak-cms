/**
 * Test All Slide Type Configurations
 * 
 * Comprehensive test suite to verify all slide type configurations work correctly.
 * 
 * Usage:
 *   npx tsx scripts/test-all-slide-configs.ts
 */

// Load environment variables BEFORE any other imports
import dotenv from "dotenv";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("❌ Error: Missing Supabase environment variables");
  process.exit(1);
}

import { createClient } from "@supabase/supabase-js";
import { recordToConfig, validateSlideTypeConfig } from "../lib/schemas/slideTypeConfig";
import type { SlideTypeConfigRecord } from "../lib/schemas/slideTypeConfig";
import { getFieldDefinition, FIELD_REGISTRY } from "../lib/schemas/slideFieldRegistry";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TestResult {
  typeKey: string;
  displayName: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Expected fields for each slide type based on current hardcoded logic
 */
const EXPECTED_FIELDS: Record<string, string[]> = {
  "text-slide": [
    "slideId", "slideType", "groupId", "groupName", "orderIndex", "label",
    "title", "subtitle", "body", "buttons"
  ],
  "title-slide": [
    "slideId", "slideType", "groupId", "groupName", "orderIndex", "label",
    "title", "subtitle", "buttons"
  ],
  "lesson-end": [
    "slideId", "slideType", "groupId", "groupName", "orderIndex", "label",
    "title", "lessonEndMessage", "lessonEndActions", "buttons"
  ],
  "ai-speak-repeat": [
    "slideId", "slideType", "groupId", "groupName", "orderIndex", "label",
    "buttons", "defaultLang", "audioId", "phrases",
    "isInteractive", "allowSkip", "allowRetry", "isActivity",
    "maxAttempts", "minAttemptsBeforeSkip", "activityName"
  ],
  "ai-speak-student-repeat": [
    "slideId", "slideType", "groupId", "groupName", "orderIndex", "label",
    "buttons", "defaultLang", "audioId", "instructions", "promptLabel", "elements",
    "isInteractive", "allowSkip", "allowRetry", "isActivity",
    "onCompleteAtIndex", "maxAttempts", "minAttemptsBeforeSkip", "activityName"
  ],
  "speech-match": [
    "slideId", "slideType", "groupId", "groupName", "orderIndex", "label",
    "title", "subtitle", "note", "buttons", "defaultLang", "audioId", "choiceElements",
    "isInteractive", "allowSkip", "allowRetry", "isActivity",
    "maxAttempts", "minAttemptsBeforeSkip", "activityName"
  ]
};

/**
 * Expected sections for each slide type
 */
const EXPECTED_SECTIONS: Record<string, string[]> = {
  "text-slide": ["identity", "content"],
  "title-slide": ["identity", "content"],
  "lesson-end": ["identity", "content"],
  "ai-speak-repeat": ["identity", "content", "language", "media", "speech", "interaction", "flow", "metadata"],
  "ai-speak-student-repeat": ["identity", "content", "language", "media", "speech", "interaction", "flow", "metadata"],
  "speech-match": ["identity", "content", "language", "media", "speech", "interaction", "flow", "metadata"]
};

async function testConfig(typeKey: string): Promise<TestResult> {
  const result: TestResult = {
    typeKey,
    displayName: "",
    passed: true,
    errors: [],
    warnings: []
  };

  // Load configuration
  const { data: configData, error: configError } = await supabase
    .from("slide_type_configs")
    .select("*")
    .eq("type_key", typeKey)
    .maybeSingle();

  if (configError) {
    result.passed = false;
    result.errors.push(`Failed to load configuration: ${configError.message}`);
    return result;
  }

  if (!configData) {
    result.passed = false;
    result.errors.push(`Configuration not found in database`);
    return result;
  }

  const config = recordToConfig(configData as SlideTypeConfigRecord);
  result.displayName = config.displayName;

  // Test 1: Configuration structure is valid
  const validation = validateSlideTypeConfig(config);
  if (!validation.valid) {
    result.passed = false;
    result.errors.push(`Invalid configuration structure: ${validation.errors.join(", ")}`);
  }

  // Test 2: All field IDs reference valid fields in registry
  const invalidFields: string[] = [];
  config.formConfig.fields.forEach(field => {
    const fieldDef = getFieldDefinition(field.fieldId);
    if (!fieldDef) {
      invalidFields.push(field.fieldId);
    }
  });

  if (invalidFields.length > 0) {
    result.passed = false;
    result.errors.push(`Invalid field IDs: ${invalidFields.join(", ")}`);
  }

  // Test 3: All section IDs are defined
  const sectionIds = new Set(config.formConfig.sections.map(s => s.id));
  const fieldSectionIds = new Set(config.formConfig.fields.map(f => f.sectionId));
  const undefinedSections: string[] = [];

  fieldSectionIds.forEach(sectionId => {
    if (!sectionIds.has(sectionId)) {
      undefinedSections.push(sectionId);
    }
  });

  if (undefinedSections.length > 0) {
    result.passed = false;
    result.errors.push(`Fields reference undefined sections: ${undefinedSections.join(", ")}`);
  }

  // Test 4: Expected fields are present
  const expectedFields = EXPECTED_FIELDS[typeKey] || [];
  const actualFields = config.formConfig.fields.map(f => f.fieldId);
  const missingFields = expectedFields.filter(f => !actualFields.includes(f));
  const extraFields = actualFields.filter(f => !expectedFields.includes(f));

  if (missingFields.length > 0) {
    result.passed = false;
    result.errors.push(`Missing expected fields: ${missingFields.join(", ")}`);
  }

  if (extraFields.length > 0) {
    result.warnings.push(`Extra fields (may be intentional): ${extraFields.join(", ")}`);
  }

  // Test 5: Expected sections are present
  const expectedSections = EXPECTED_SECTIONS[typeKey] || [];
  const actualSections = config.formConfig.sections.map(s => s.id);
  const missingSections = expectedSections.filter(s => !actualSections.includes(s));
  const extraSections = actualSections.filter(s => !expectedSections.includes(s));

  if (missingSections.length > 0) {
    result.passed = false;
    result.errors.push(`Missing expected sections: ${missingSections.join(", ")}`);
  }

  if (extraSections.length > 0) {
    result.warnings.push(`Extra sections (may be intentional): ${extraSections.join(", ")}`);
  }

  // Test 6: Required fields are marked as required
  const expectedRequiredFields = ["label"]; // Label is always required
  expectedRequiredFields.forEach(fieldId => {
    const field = config.formConfig.fields.find(f => f.fieldId === fieldId);
    if (field && !field.required) {
      result.warnings.push(`Field "${fieldId}" should be required but is not marked as required`);
    }
  });

  // Test 7: Configuration is active
  if (!config.isActive) {
    result.warnings.push("Configuration is not active (isActive = false)");
  }

  // Test 8: Version is correct
  if (config.version !== 1) {
    result.warnings.push(`Version is ${config.version} (expected 1 for initial config)`);
  }

  return result;
}

async function runAllTests() {
  console.log("🧪 Testing all slide type configurations...\n");

  const typeKeys = [
    "text-slide",
    "title-slide",
    "lesson-end",
    "ai-speak-repeat",
    "ai-speak-student-repeat",
    "speech-match"
  ];

  const results: TestResult[] = [];

  for (const typeKey of typeKeys) {
    console.log(`Testing ${typeKey}...`);
    const result = await testConfig(typeKey);
    results.push(result);
  }

  console.log("\n" + "=".repeat(70));
  console.log("TEST RESULTS");
  console.log("=".repeat(70) + "\n");

  let totalPassed = 0;
  let totalFailed = 0;

  for (const result of results) {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${result.displayName} (${result.typeKey})`);

    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        console.log(`   ❌ ${error}`);
      });
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning}`);
      });
    }

    // Show field count (already have config from testConfig)
    const { data: configData } = await supabase
      .from("slide_type_configs")
      .select("form_config")
      .eq("type_key", result.typeKey)
      .maybeSingle();

    if (configData) {
      const config = recordToConfig(configData as SlideTypeConfigRecord);
      console.log(`   📊 ${config.formConfig.fields.length} fields, ${config.formConfig.sections.length} sections, ${config.formConfig.validationRules.length} validation rules`);
    }

    console.log("");

    if (result.passed) {
      totalPassed++;
    } else {
      totalFailed++;
    }
  }

  console.log("=".repeat(70));
  console.log(`Summary: ${totalPassed}/${results.length} passed, ${totalFailed}/${results.length} failed\n`);

  // Detailed comparison
  console.log("📋 Field Comparison:\n");
  for (const result of results) {
    const expected = EXPECTED_FIELDS[result.typeKey] || [];
    const { data: configData } = await supabase
      .from("slide_type_configs")
      .select("form_config")
      .eq("type_key", result.typeKey)
      .single();

    if (configData) {
      const config = recordToConfig(configData as SlideTypeConfigRecord);
      const actual = config.formConfig.fields.map(f => f.fieldId);
      const missing = expected.filter(f => !actual.includes(f));
      const extra = actual.filter(f => !expected.includes(f));

      console.log(`${result.displayName}:`);
      if (missing.length === 0 && extra.length === 0) {
        console.log(`   ✅ All ${expected.length} expected fields match`);
      } else {
        if (missing.length > 0) {
          console.log(`   ❌ Missing: ${missing.join(", ")}`);
        }
        if (extra.length > 0) {
          console.log(`   ⚠️  Extra: ${extra.join(", ")}`);
        }
      }
      console.log("");
    }
  }

  if (totalFailed === 0) {
    console.log("✅ All configurations passed all tests!");
    console.log("   Ready to enable dynamic forms for all types.\n");
    process.exit(0);
  } else {
    console.log("❌ Some configurations failed. Review errors above.\n");
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

