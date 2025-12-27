/**
 * Tier 2.2 Step 1 Test: Transaction Utilities
 * 
 * Tests: Does executeTransaction() work correctly?
 */

// Load environment variables
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { executeTransaction } from "../lib/utils/transactions";

async function testTransactionUtils() {
  console.log("🧪 Step 1 Test: Transaction Utilities");
  console.log("");

  try {
    // Test calling a non-existent function (should return error)
    console.log("Testing with non-existent function (should error)...");
    const result1 = await executeTransaction("non_existent_function", {});
    
    if (!result1.error) {
      console.log("❌ ERROR: Should have returned error for non-existent function");
      process.exit(1);
    }

    console.log(`✅ SUCCESS: Correctly returned error: ${result1.error}`);
    console.log("");

    // Note: We can't test actual transaction functions until Step 2 (RPC functions created)
    console.log("✅ Step 1 PASSED: Transaction utilities work!");
    console.log("   Note: Actual transaction functions will be tested in Step 2");
  } catch (err) {
    console.log("❌ FAILED:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

testTransactionUtils();

