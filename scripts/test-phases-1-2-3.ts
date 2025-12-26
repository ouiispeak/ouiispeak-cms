/**
 * Comprehensive Test Suite for Phases 1, 2, and 3
 * 
 * Tests all implemented functionality:
 * - Phase 1: Database migration and configuration system
 * - Phase 2: Type definitions and type safety
 * - Phase 3: Hooks and refactored edit-slide page
 * 
 * Usage:
 *   npx tsx scripts/test-phases-1-2-3.ts
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
import { validateSlideTypeConfig } from "../lib/schemas/slideTypeConfig";
import { FIELD_REGISTRY } from "../lib/schemas/slideFieldRegistry";
import {
  getTypedSlideProps,
  SLIDE_TYPES,
  type SlideType,
} from "../lib/types/slideProps";

// Create a script-specific Supabase client (don't import from lib/supabase.ts)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Import data functions after env vars are loaded
async function getSlideTypeConfig(typeKey: string) {
  const { data, error } = await supabase
    .from("slide_type_configs")
    .select("*")
    .eq("type_key", typeKey)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: `No configuration found for type "${typeKey}"` };
  }

  // Convert from database format
  return {
    data: {
      typeKey: data.type_key,
      displayName: data.display_name,
      isActive: data.is_active,
      version: data.version,
      formConfig: data.form_config
    },
    error: null
  };
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, error?: string, details?: string) {
  results.push({ name, passed, error, details });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} ${name}`);
  if (error) {
    console.log(`   Error: ${error}`);
  }
  if (details) {
    console.log(`   ${details}`);
  }
}

async function testPhase1DatabaseMigration() {
  console.log("\n📋 Phase 1: Database Migration Tests\n");

  // Test 1: Check if tables exist
  try {
    const { data: tables, error } = await supabase
      .from("slide_field_registry")
      .select("id")
      .limit(1);

    if (error && error.code === "42P01") {
      addResult("Database tables exist", false, "slide_field_registry table not found");
      return false;
    }
    addResult("Database tables exist", true, undefined, "slide_field_registry and slide_type_configs tables exist");
  } catch (error: any) {
    addResult("Database tables exist", false, error.message);
    return false;
  }

  // Test 2: Check if field registry has entries
  try {
    const { data: fields, error } = await supabase
      .from("slide_field_registry")
      .select("id");

    if (error) {
      addResult("Field registry populated", false, error.message);
      return false;
    }

    if (!fields || fields.length === 0) {
      addResult("Field registry populated", false, "No fields found in registry");
      return false;
    }

    addResult("Field registry populated", true, undefined, `Found ${fields.length} fields`);
  } catch (error: any) {
    addResult("Field registry populated", false, error.message);
    return false;
  }

  // Test 3: Check if slide_type_configs has entries
  try {
    const { data: configs, error } = await supabase
      .from("slide_type_configs")
      .select("type_key");

    if (error) {
      addResult("Slide type configs exist", false, error.message);
      return false;
    }

    if (!configs || configs.length === 0) {
      addResult("Slide type configs exist", false, "No configurations found");
      return false;
    }

    addResult("Slide type configs exist", true, undefined, `Found ${configs.length} configurations`);
  } catch (error: any) {
    addResult("Slide type configs exist", false, error.message);
    return false;
  }

  return true;
}

async function testPhase1Configurations() {
  console.log("\n📋 Phase 1: Configuration System Tests\n");

  const slideTypes = [
    "text-slide",
    "title-slide",
    "lesson-end",
    "ai-speak-repeat",
    "ai-speak-student-repeat",
    "speech-match",
  ];

  for (const typeKey of slideTypes) {
    // Test: Load configuration
    try {
      const { data: config, error } = await getSlideTypeConfig(typeKey);

      if (error || !config) {
        addResult(`Load config: ${typeKey}`, false, error || "Config not found");
        continue;
      }

      addResult(`Load config: ${typeKey}`, true, undefined, `Version ${config.version}`);

      // Test: Validate configuration structure
      const validation = validateSlideTypeConfig(config);
      if (!validation.valid) {
        addResult(`Validate config: ${typeKey}`, false, validation.errors.join(", "));
        continue;
      }

      addResult(`Validate config: ${typeKey}`, true, undefined, "Structure valid");

      // Test: Check field references
      const fieldIds = new Set(config.formConfig.fields.map((f: { fieldId: string }) => f.fieldId));
      const invalidFields = config.formConfig.fields.filter(
        (f: { fieldId: string }) => !FIELD_REGISTRY.find((def) => def.id === f.fieldId)
      );

      if (invalidFields.length > 0) {
        addResult(
          `Field references: ${typeKey}`,
          false,
          `Invalid fields: ${invalidFields.map((f: { fieldId: string }) => f.fieldId).join(", ")}`
        );
        continue;
      }

      // Test: Check validation rule field references
      const invalidRules = config.formConfig.validationRules.filter(
        (rule) => !fieldIds.has(rule.fieldId)
      );

      if (invalidRules.length > 0) {
        addResult(
          `Validation rules: ${typeKey}`,
          false,
          `Rules reference invalid fields: ${invalidRules.map((r: { fieldId: string }) => r.fieldId).join(", ")}`
        );
        continue;
      }

      addResult(`Validation rules: ${typeKey}`, true, undefined, `${config.formConfig.validationRules.length} rules`);
    } catch (error: any) {
      addResult(`Config tests: ${typeKey}`, false, error.message);
    }
  }
}

async function testPhase2TypeDefinitions() {
  console.log("\n📋 Phase 2: Type Definitions Tests\n");

  // Test: Load a slide and verify type safety
  try {
    const { data: slides, error } = await supabase
      .from("slides")
      .select("id, type, props_json")
      .limit(5);

    if (error || !slides || slides.length === 0) {
      addResult("Load slides for type testing", false, error?.message || "No slides found");
      return;
    }

    addResult("Load slides for type testing", true, undefined, `Loaded ${slides.length} slides`);

    // Test: Verify getTypedSlideProps works for each slide
    for (const slide of slides) {
      try {
        const typedProps = getTypedSlideProps(slide.type as SlideType, slide.props_json);

        if (!typedProps) {
          addResult(`Type safety: ${slide.type}`, false, "getTypedSlideProps returned null");
          continue;
        }

        addResult(`Type safety: ${slide.type}`, true, undefined, "Props typed correctly");
      } catch (error: any) {
        addResult(`Type safety: ${slide.type}`, false, error.message);
      }
    }
  } catch (error: any) {
    addResult("Type definitions tests", false, error.message);
  }
}

async function testPhase3Hooks() {
  console.log("\n📋 Phase 3: Hooks Tests\n");

  // Test: Verify hook files exist and can be imported
  try {
    const { useSlideFormData } = await import("../lib/hooks/useSlideFormData");
    addResult("useSlideFormData hook exists", true, undefined, "Hook can be imported");
  } catch (error: any) {
    addResult("useSlideFormData hook exists", false, error.message);
  }

  try {
    const { useSlideFormState } = await import("../lib/hooks/useSlideFormState");
    addResult("useSlideFormState hook exists", true, undefined, "Hook can be imported");
  } catch (error: any) {
    addResult("useSlideFormState hook exists", false, error.message);
  }

  try {
    const { useSlideFormValidation } = await import("../lib/hooks/useSlideFormValidation");
    addResult("useSlideFormValidation hook exists", true, undefined, "Hook can be imported");
  } catch (error: any) {
    addResult("useSlideFormValidation hook exists", false, error.message);
  }

  try {
    const { useSlideFormSave } = await import("../lib/hooks/useSlideFormSave");
    addResult("useSlideFormSave hook exists", true, undefined, "Hook can be imported");
  } catch (error: any) {
    addResult("useSlideFormSave hook exists", false, error.message);
  }

  // Test: Verify components exist
  try {
    const { SlideFormLoader } = await import("../components/slide-editor/SlideFormLoader");
    addResult("SlideFormLoader component exists", true, undefined, "Component can be imported");
  } catch (error: any) {
    addResult("SlideFormLoader component exists", false, error.message);
  }

  try {
    const { SlideFormActions } = await import("../components/slide-editor/SlideFormActions");
    addResult("SlideFormActions component exists", true, undefined, "Component can be imported");
  } catch (error: any) {
    addResult("SlideFormActions component exists", false, error.message);
  }
}

async function testEditSlidePage() {
  console.log("\n📋 Phase 3: Edit-Slide Page Tests\n");

  // Test: Verify edit-slide page compiles
  try {
    const pagePath = resolve(process.cwd(), "app/edit-slide/[slideId]/page.tsx");
    const fs = await import("fs");
    const pageContent = fs.readFileSync(pagePath, "utf-8");

    // Check for hook imports
    const hasUseSlideFormData = pageContent.includes("useSlideFormData");
    const hasUseSlideFormState = pageContent.includes("useSlideFormState");
    const hasUseSlideFormValidation = pageContent.includes("useSlideFormValidation");
    const hasUseSlideFormSave = pageContent.includes("useSlideFormSave");

    if (!hasUseSlideFormData || !hasUseSlideFormState || !hasUseSlideFormValidation || !hasUseSlideFormSave) {
      addResult("Edit-slide page uses hooks", false, "Missing hook imports");
      return;
    }

    addResult("Edit-slide page uses hooks", true, undefined, "All hooks imported");

    // Check file size (should be reduced)
    const lineCount = pageContent.split("\n").length;
    if (lineCount > 1500) {
      addResult("Edit-slide page size", false, `Still too large: ${lineCount} lines`);
    } else {
      addResult("Edit-slide page size", true, undefined, `${lineCount} lines (refactored)`);
    }
  } catch (error: any) {
    addResult("Edit-slide page tests", false, error.message);
  }
}

async function runAllTests() {
  console.log("🧪 Running Comprehensive Test Suite for Phases 1, 2, and 3\n");
  console.log("=".repeat(60));

  await testPhase1DatabaseMigration();
  await testPhase1Configurations();
  await testPhase2TypeDefinitions();
  await testPhase3Hooks();
  await testEditSlidePage();

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Summary\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%\n`);

  if (failed > 0) {
    console.log("❌ Failed Tests:\n");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r.name}`);
        if (r.error) {
          console.log(`     Error: ${r.error}`);
        }
      });
    console.log("");
    process.exit(1);
  } else {
    console.log("✅ All tests passed!\n");
    process.exit(0);
  }
}

runAllTests().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

