/**
 * Tier 2.2 Step 2 Test: Transaction RPC Functions
 * 
 * Tests: Do the transaction RPC functions work correctly?
 * 
 * Prerequisites: Run migration 003_add_transaction_functions.sql first
 */

// Load environment variables
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { executeTransaction } from "../lib/utils/transactions";
import { supabase } from "../lib/supabase";

async function testTransactionRPC() {
  console.log("🧪 Step 2 Test: Transaction RPC Functions");
  console.log("");

  try {
    // First, verify functions exist by checking if we can call them
    console.log("Testing function existence...");
    
    // Test with invalid UUID (should error gracefully)
    const testResult = await executeTransaction("delete_module_transaction", {
      module_id: "00000000-0000-0000-0000-000000000000",
    });

    // If function doesn't exist, we'll get a different error
    if (testResult.error && testResult.error.includes("Could not find the function")) {
      console.log("❌ ERROR: Transaction functions not found!");
      console.log("   Please run migration 003_add_transaction_functions.sql first");
      process.exit(1);
    }

    console.log("✅ Functions exist (error is expected for non-existent module)");
    console.log("");

    // Verify all four functions exist
    const functions = [
      "delete_module_transaction",
      "delete_lesson_transaction",
      "delete_group_transaction",
      "delete_slide_transaction",
    ];

    console.log("Verifying all transaction functions exist...");
    for (const funcName of functions) {
      const { error } = await supabase.rpc(funcName, {
        [funcName.includes("module") ? "module_id" : 
         funcName.includes("lesson") ? "lesson_id" :
         funcName.includes("group") ? "group_id" : "slide_id"]: "00000000-0000-0000-0000-000000000000",
      });

      if (error && error.message.includes("Could not find the function")) {
        console.log(`❌ ERROR: Function ${funcName} not found`);
        process.exit(1);
      }
    }

    console.log("✅ All transaction functions exist");
    console.log("");

    console.log("✅ Step 2 PASSED: Transaction RPC functions are available!");
    console.log("   Note: Actual deletion testing will be done in Step 3");
  } catch (err) {
    console.log("❌ FAILED:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

testTransactionRPC();

