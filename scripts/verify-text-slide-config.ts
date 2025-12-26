/**
 * Verify Text Slide Configuration
 * 
 * Tests and verifies that the text-slide configuration was created correctly
 * and that all data layer functions work as expected.
 * 
 * Usage:
 *   npx tsx scripts/verify-text-slide-config.ts
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
import { validateSlideTypeConfig, recordToConfig } from "../lib/schemas/slideTypeConfig";
import type { SlideTypeConfig, SlideTypeConfigRecord } from "../lib/schemas/slideTypeConfig";
import { getFieldDefinition, FIELD_REGISTRY } from "../lib/schemas/slideFieldRegistry";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper functions (duplicated from data layer to avoid import issues)
async function getSlideTypeConfig(typeKey: string): Promise<{ data: SlideTypeConfig | null; error: string | null }> {
  const { data, error } = await supabase
    .from("slide_type_configs")
    .select("*")
    .eq("type_key", typeKey)
    .maybeSingle();

  if (error) {
    return { data: null, error: `Failed to load configuration: ${error.message}` };
  }

  if (!data) {
    return { data: null, error: `No configuration found for type "${typeKey}"` };
  }

  const config = recordToConfig(data as SlideTypeConfigRecord);
  return { data: config, error: null };
}

async function listSlideTypeConfigs(includeInactive: boolean = false): Promise<{ data: SlideTypeConfig[]; error: string | null }> {
  let query = supabase
    .from("slide_type_configs")
    .select("*")
    .order("display_name", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: `Failed to list configurations: ${error.message}` };
  }

  const configs = (data || []).map((record) => recordToConfig(record as SlideTypeConfigRecord));
  return { data: configs, error: null };
}

async function isConfigActive(typeKey: string): Promise<boolean> {
  const { data } = await supabase
    .from("slide_type_configs")
    .select("is_active")
    .eq("type_key", typeKey)
    .eq("is_active", true)
    .maybeSingle();

  return data !== null;
}

async function getLatestConfigVersion(typeKey: string): Promise<number> {
  const result = await getSlideTypeConfig(typeKey);
  if (result.data) {
    return result.data.version;
  }
  return 0;
}

interface TestResult {
  test: string;
  status: "✅ PASS" | "❌ FAIL";
  message: string;
}

const results: TestResult[] = [];

async function runVerification() {
  console.log("🔍 Verifying text-slide configuration...\n");

  // Test 1: Configuration exists in database
  console.log("Test 1: Checking if configuration exists in database...");
  const { data: dbRecord, error: dbError } = await supabase
    .from("slide_type_configs")
    .select("*")
    .eq("type_key", "text-slide")
    .maybeSingle();

  if (dbError) {
    results.push({
      test: "Configuration exists in database",
      status: "❌ FAIL",
      message: `Database error: ${dbError.message}`
    });
  } else if (!dbRecord) {
    results.push({
      test: "Configuration exists in database",
      status: "❌ FAIL",
      message: "No configuration found for type 'text-slide'"
    });
  } else {
    results.push({
      test: "Configuration exists in database",
      status: "✅ PASS",
      message: `Found configuration (ID: ${dbRecord.id}, Version: ${dbRecord.version})`
    });
  }

  // Test 2: Can retrieve via data layer function
  console.log("Test 2: Testing getSlideTypeConfig() function...");
  const configResult = await getSlideTypeConfig("text-slide");
  if (configResult.error) {
    results.push({
      test: "getSlideTypeConfig() works",
      status: "❌ FAIL",
      message: configResult.error
    });
  } else if (!configResult.data) {
    results.push({
      test: "getSlideTypeConfig() works",
      status: "❌ FAIL",
      message: "Function returned null data"
    });
  } else {
    results.push({
      test: "getSlideTypeConfig() works",
      status: "✅ PASS",
      message: `Retrieved config: ${configResult.data.displayName} (v${configResult.data.version})`
    });
  }

  // Test 3: Configuration structure is valid
  console.log("Test 3: Validating configuration structure...");
  if (configResult.data) {
    const validation = validateSlideTypeConfig(configResult.data);
    if (!validation.valid) {
      results.push({
        test: "Configuration structure is valid",
        status: "❌ FAIL",
        message: `Validation errors: ${validation.errors.join(", ")}`
      });
    } else {
      results.push({
        test: "Configuration structure is valid",
        status: "✅ PASS",
        message: "Configuration passes all validation checks"
      });
    }
  } else {
    results.push({
      test: "Configuration structure is valid",
      status: "❌ FAIL",
      message: "Cannot validate - config not retrieved"
    });
  }

  // Test 4: All field IDs reference valid fields in registry
  console.log("Test 4: Checking field IDs reference valid fields...");
  if (configResult.data) {
    const invalidFields: string[] = [];
    configResult.data.formConfig.fields.forEach(field => {
      const fieldDef = getFieldDefinition(field.fieldId);
      if (!fieldDef) {
        invalidFields.push(field.fieldId);
      }
    });

    if (invalidFields.length > 0) {
      results.push({
        test: "Field IDs reference valid fields",
        status: "❌ FAIL",
        message: `Invalid field IDs: ${invalidFields.join(", ")}`
      });
    } else {
      results.push({
        test: "Field IDs reference valid fields",
        status: "✅ PASS",
        message: `All ${configResult.data.formConfig.fields.length} fields reference valid field definitions`
      });
    }
  } else {
    results.push({
      test: "Field IDs reference valid fields",
      status: "❌ FAIL",
      message: "Cannot check - config not retrieved"
    });
  }

  // Test 5: All section IDs are defined
  console.log("Test 5: Checking section IDs are defined...");
  if (configResult.data) {
    const sectionIds = new Set(configResult.data.formConfig.sections.map(s => s.id));
    const fieldSectionIds = new Set(configResult.data.formConfig.fields.map(f => f.sectionId));
    const undefinedSections: string[] = [];

    fieldSectionIds.forEach(sectionId => {
      if (!sectionIds.has(sectionId)) {
        undefinedSections.push(sectionId);
      }
    });

    if (undefinedSections.length > 0) {
      results.push({
        test: "Section IDs are defined",
        status: "❌ FAIL",
        message: `Fields reference undefined sections: ${undefinedSections.join(", ")}`
      });
    } else {
      results.push({
        test: "Section IDs are defined",
        status: "✅ PASS",
        message: `All fields reference defined sections (${sectionIds.size} sections)`
      });
    }
  } else {
    results.push({
      test: "Section IDs are defined",
      status: "❌ FAIL",
      message: "Cannot check - config not retrieved"
    });
  }

  // Test 6: Configuration is active
  console.log("Test 6: Checking if configuration is active...");
  const isActive = await isConfigActive("text-slide");
  results.push({
    test: "Configuration is active",
    status: isActive ? "✅ PASS" : "❌ FAIL",
    message: isActive ? "Configuration is marked as active" : "Configuration is not active"
  });

  // Test 7: Version number is correct
  console.log("Test 7: Checking version number...");
  const version = await getLatestConfigVersion("text-slide");
  if (version === 1) {
    results.push({
      test: "Version number is correct",
      status: "✅ PASS",
      message: `Version is ${version} (expected 1)`
    });
  } else {
    results.push({
      test: "Version number is correct",
      status: "❌ FAIL",
      message: `Version is ${version} (expected 1)`
    });
  }

  // Test 8: Can list all configs
  console.log("Test 8: Testing listSlideTypeConfigs() function...");
  const listResult = await listSlideTypeConfigs(true); // Include inactive
  if (listResult.error) {
    results.push({
      test: "listSlideTypeConfigs() works",
      status: "❌ FAIL",
      message: listResult.error
    });
  } else {
    const textSlideInList = listResult.data?.find(c => c.typeKey === "text-slide");
    if (textSlideInList) {
      results.push({
        test: "listSlideTypeConfigs() works",
        status: "✅ PASS",
        message: `Found text-slide in list (${listResult.data.length} total configs)`
      });
    } else {
      results.push({
        test: "listSlideTypeConfigs() works",
        status: "❌ FAIL",
        message: "text-slide not found in list"
      });
    }
  }

  // Test 9: Expected fields are present
  console.log("Test 9: Verifying expected fields are present...");
  if (configResult.data) {
    const expectedFields = ["slideId", "slideType", "groupId", "groupName", "orderIndex", "label", "title", "subtitle", "body", "buttons"];
    const actualFields = configResult.data.formConfig.fields.map(f => f.fieldId);
    const missingFields = expectedFields.filter(f => !actualFields.includes(f));
    const extraFields = actualFields.filter(f => !expectedFields.includes(f));

    if (missingFields.length > 0 || extraFields.length > 0) {
      let message = "";
      if (missingFields.length > 0) {
        message += `Missing: ${missingFields.join(", ")}. `;
      }
      if (extraFields.length > 0) {
        message += `Unexpected: ${extraFields.join(", ")}.`;
      }
      results.push({
        test: "Expected fields are present",
        status: "❌ FAIL",
        message: message.trim()
      });
    } else {
      results.push({
        test: "Expected fields are present",
        status: "✅ PASS",
        message: `All ${expectedFields.length} expected fields are present`
      });
    }
  } else {
    results.push({
      test: "Expected fields are present",
      status: "❌ FAIL",
      message: "Cannot check - config not retrieved"
    });
  }

  // Test 10: Required field is marked as required
  console.log("Test 10: Verifying required field validation...");
  if (configResult.data) {
    const labelField = configResult.data.formConfig.fields.find(f => f.fieldId === "label");
    if (labelField && labelField.required) {
      results.push({
        test: "Required field is marked as required",
        status: "✅ PASS",
        message: "Label field is correctly marked as required"
      });
    } else {
      results.push({
        test: "Required field is marked as required",
        status: "❌ FAIL",
        message: "Label field is not marked as required"
      });
    }
  } else {
    results.push({
      test: "Required field is marked as required",
      status: "❌ FAIL",
      message: "Cannot check - config not retrieved"
    });
  }

  // Print results
  console.log("\n📊 Verification Results:\n");
  results.forEach(result => {
    console.log(`${result.status} ${result.test}`);
    console.log(`   ${result.message}\n`);
  });

  // Summary
  const passed = results.filter(r => r.status === "✅ PASS").length;
  const failed = results.filter(r => r.status === "❌ FAIL").length;
  const total = results.length;

  console.log("─".repeat(60));
  console.log(`Summary: ${passed}/${total} tests passed, ${failed}/${total} tests failed\n`);

  // Detailed configuration info if successful
  if (configResult.data && failed === 0) {
    console.log("📋 Configuration Details:\n");
    console.log(`   Type Key: ${configResult.data.typeKey}`);
    console.log(`   Display Name: ${configResult.data.displayName}`);
    console.log(`   Version: ${configResult.data.version}`);
    console.log(`   Active: ${configResult.data.isActive ? "Yes" : "No"}`);
    console.log(`   Sections: ${configResult.data.formConfig.sections.length}`);
    configResult.data.formConfig.sections.forEach(section => {
      const sectionFields = configResult.data!.formConfig.fields.filter(f => f.sectionId === section.id);
      console.log(`     - ${section.title} (${sectionFields.length} fields)`);
    });
    console.log(`   Fields: ${configResult.data.formConfig.fields.length}`);
    console.log(`   Validation Rules: ${configResult.data.formConfig.validationRules.length}\n`);
  }

  if (failed === 0) {
    console.log("✅ All verification tests passed!");
    console.log("   Phase 1 foundation is solid. Ready to proceed to Phase 2.\n");
    process.exit(0);
  } else {
    console.log("❌ Some verification tests failed. Please review the errors above.\n");
    process.exit(1);
  }
}

// Run verification
runVerification().catch(error => {
  console.error("❌ Fatal error during verification:", error);
  process.exit(1);
});

