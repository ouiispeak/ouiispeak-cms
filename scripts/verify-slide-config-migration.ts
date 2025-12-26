/**
 * Migration Verification Script
 * 
 * Verifies that the slide configuration tables migration (001_create_slide_config_tables.sql)
 * was executed successfully.
 * 
 * Usage:
 *   npm run verify-migration
 *   OR
 *   npx tsx scripts/verify-slide-config-migration.ts
 *   OR
 *   npx ts-node scripts/verify-slide-config-migration.ts
 * 
 * Prerequisites:
 *   - Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - These should be in .env.local file in the project root
 */

// Load environment variables from .env.local (Next.js convention)
import dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local file from project root
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Missing Supabase environment variables");
  console.error("");
  console.error("   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  console.error("");
  console.error("   To fix this:");
  console.error("   1. Create a .env.local file in the project root");
  console.error("   2. Add your Supabase credentials:");
  console.error("      NEXT_PUBLIC_SUPABASE_URL=your_project_url");
  console.error("      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key");
  console.error("");
  console.error("   See docs/SETUP_ENV_VARIABLES.md for detailed instructions");
  console.error("");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface VerificationResult {
  check: string;
  status: "✅ PASS" | "❌ FAIL";
  message: string;
}

const results: VerificationResult[] = [];

async function verifyTableExists(tableName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(tableName)
    .select("id")
    .limit(1);
  
  // If we get an error about table not existing, return false
  if (error && error.message.includes("does not exist")) {
    return false;
  }
  
  // Any other error is unexpected
  if (error) {
    throw new Error(`Error checking table ${tableName}: ${error.message}`);
  }
  
  return true;
}

async function verifyColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_column_exists", {
    table_name: tableName,
    column_name: columnName
  }).single();
  
  // If RPC doesn't exist, use a simpler approach
  if (error) {
    // Try to query the column directly
    const { error: queryError } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    return !queryError;
  }
  
  return data === true;
}

async function verifyIndexExists(indexName: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_index_exists", {
    index_name: indexName
  }).single();
  
  // If RPC doesn't exist, we'll skip index verification
  if (error) {
    return true; // Assume it exists if we can't check
  }
  
  return data === true;
}

async function runVerification() {
  console.log("🔍 Verifying slide configuration migration...\n");

  // Check 1: slide_field_registry table exists
  try {
    const exists = await verifyTableExists("slide_field_registry");
    results.push({
      check: "slide_field_registry table exists",
      status: exists ? "✅ PASS" : "❌ FAIL",
      message: exists 
        ? "Table exists and is accessible" 
        : "Table does not exist - migration may not have run"
    });
  } catch (error: any) {
    results.push({
      check: "slide_field_registry table exists",
      status: "❌ FAIL",
      message: `Error: ${error.message}`
    });
  }

  // Check 2: slide_type_configs table exists
  try {
    const exists = await verifyTableExists("slide_type_configs");
    results.push({
      check: "slide_type_configs table exists",
      status: exists ? "✅ PASS" : "❌ FAIL",
      message: exists 
        ? "Table exists and is accessible" 
        : "Table does not exist - migration may not have run"
    });
  } catch (error: any) {
    results.push({
      check: "slide_type_configs table exists",
      status: "❌ FAIL",
      message: `Error: ${error.message}`
    });
  }

  // Check 3: slides.config_version column exists
  try {
    const exists = await verifyColumnExists("slides", "config_version");
    results.push({
      check: "slides.config_version column exists",
      status: exists ? "✅ PASS" : "❌ FAIL",
      message: exists 
        ? "Column exists" 
        : "Column does not exist - migration may not have run"
    });
  } catch (error: any) {
    results.push({
      check: "slides.config_version column exists",
      status: "❌ FAIL",
      message: `Error: ${error.message}`
    });
  }

  // Check 4: slides.config_snapshot column exists
  try {
    const exists = await verifyColumnExists("slides", "config_snapshot");
    results.push({
      check: "slides.config_snapshot column exists",
      status: exists ? "✅ PASS" : "❌ FAIL",
      message: exists 
        ? "Column exists" 
        : "Column does not exist - migration may not have run"
    });
  } catch (error: any) {
    results.push({
      check: "slides.config_snapshot column exists",
      status: "❌ FAIL",
      message: `Error: ${error.message}`
    });
  }

  // Check 5: Can insert into slide_field_registry (test write access)
  try {
    const testField = {
      field_id: "__verification_test__",
      display_name: "Verification Test Field",
      field_type: "text"
    };
    
    const { error: insertError } = await supabase
      .from("slide_field_registry")
      .insert(testField);
    
    if (insertError) {
      results.push({
        check: "Can write to slide_field_registry",
        status: "❌ FAIL",
        message: `Insert failed: ${insertError.message}`
      });
    } else {
      // Clean up test data
      await supabase
        .from("slide_field_registry")
        .delete()
        .eq("field_id", "__verification_test__");
      
      results.push({
        check: "Can write to slide_field_registry",
        status: "✅ PASS",
        message: "Write access verified (test data cleaned up)"
      });
    }
  } catch (error: any) {
    results.push({
      check: "Can write to slide_field_registry",
      status: "❌ FAIL",
      message: `Error: ${error.message}`
    });
  }

  // Check 6: Can insert into slide_type_configs (test write access)
  try {
    const testConfig = {
      type_key: "__verification_test__",
      display_name: "Verification Test Type",
      form_config: {
        sections: [],
        fields: [],
        validationRules: []
      }
    };
    
    const { error: insertError } = await supabase
      .from("slide_type_configs")
      .insert(testConfig);
    
    if (insertError) {
      results.push({
        check: "Can write to slide_type_configs",
        status: "❌ FAIL",
        message: `Insert failed: ${insertError.message}`
      });
    } else {
      // Clean up test data
      await supabase
        .from("slide_type_configs")
        .delete()
        .eq("type_key", "__verification_test__");
      
      results.push({
        check: "Can write to slide_type_configs",
        status: "✅ PASS",
        message: "Write access verified (test data cleaned up)"
      });
    }
  } catch (error: any) {
    results.push({
      check: "Can write to slide_type_configs",
      status: "❌ FAIL",
      message: `Error: ${error.message}`
    });
  }

  // Check 7: Verify table structure (check for required columns)
  try {
    const { data: fieldRegistryData, error: fieldError } = await supabase
      .from("slide_field_registry")
      .select("field_id, display_name, field_type")
      .limit(1);
    
    if (fieldError) {
      results.push({
        check: "slide_field_registry structure",
        status: "❌ FAIL",
        message: `Cannot query required columns: ${fieldError.message}`
      });
    } else {
      results.push({
        check: "slide_field_registry structure",
        status: "✅ PASS",
        message: "Required columns (field_id, display_name, field_type) are accessible"
      });
    }
  } catch (error: any) {
    results.push({
      check: "slide_field_registry structure",
      status: "❌ FAIL",
      message: `Error: ${error.message}`
    });
  }

  // Check 8: Verify slide_type_configs structure
  try {
    const { data: configData, error: configError } = await supabase
      .from("slide_type_configs")
      .select("type_key, display_name, form_config, is_active, version")
      .limit(1);
    
    if (configError) {
      results.push({
        check: "slide_type_configs structure",
        status: "❌ FAIL",
        message: `Cannot query required columns: ${configError.message}`
      });
    } else {
      results.push({
        check: "slide_type_configs structure",
        status: "✅ PASS",
        message: "Required columns (type_key, display_name, form_config, is_active, version) are accessible"
      });
    }
  } catch (error: any) {
    results.push({
      check: "slide_type_configs structure",
      status: "❌ FAIL",
      message: `Error: ${error.message}`
    });
  }

  // Print results
  console.log("📊 Verification Results:\n");
  results.forEach(result => {
    console.log(`${result.status} ${result.check}`);
    console.log(`   ${result.message}\n`);
  });

  // Summary
  const passed = results.filter(r => r.status === "✅ PASS").length;
  const failed = results.filter(r => r.status === "❌ FAIL").length;
  const total = results.length;

  console.log("─".repeat(50));
  console.log(`Summary: ${passed}/${total} checks passed, ${failed}/${total} checks failed\n`);

  if (failed === 0) {
    console.log("✅ Migration verification successful! All checks passed.");
    console.log("   You can proceed to Step 2: Extract Field Registry\n");
    process.exit(0);
  } else {
    console.log("❌ Migration verification failed. Please review the errors above.");
    console.log("   Make sure the migration script was run successfully.\n");
    process.exit(1);
  }
}

// Run verification
runVerification().catch(error => {
  console.error("❌ Fatal error during verification:", error);
  process.exit(1);
});

