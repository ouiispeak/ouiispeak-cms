/**
 * Test Step 9a: Does the validation function work?
 * 
 * Testing the validation function separately before using it in getters
 */

// Load env vars
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

console.log("🧪 Testing Step 9a: Validation Function\n");

try {
  const { validateRequiredEnvVar } = require("../lib/config/env");
  
  // Test 1: Valid value
  console.log("Test 1: Valid value");
  const validValue = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const result1 = validateRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL', validValue);
  console.log(`   ✅ Passed: Returned value (${result1.substring(0, 30)}...)`);
  
  // Test 2: Empty string
  console.log("\nTest 2: Empty string");
  try {
    validateRequiredEnvVar('TEST_VAR', '');
    console.error("   ❌ FAILED: Should have thrown error for empty string");
    process.exit(1);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing required')) {
      console.log(`   ✅ Passed: Threw error as expected`);
    } else {
      console.error(`   ❌ FAILED: Wrong error: ${error}`);
      process.exit(1);
    }
  }
  
  // Test 3: Undefined
  console.log("\nTest 3: Undefined value");
  try {
    validateRequiredEnvVar('TEST_VAR', undefined);
    console.error("   ❌ FAILED: Should have thrown error for undefined");
    process.exit(1);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing required')) {
      console.log(`   ✅ Passed: Threw error as expected`);
    } else {
      console.error(`   ❌ FAILED: Wrong error: ${error}`);
      process.exit(1);
    }
  }
  
  console.log("\n✅ Step 9a PASSED: Validation function works correctly\n");
  
} catch (error) {
  console.error("❌ FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
}

