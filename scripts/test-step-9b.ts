/**
 * Test Step 9b: Does supabaseUrl getter work with validation?
 */

// Load env vars
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

console.log("🧪 Testing Step 9b: supabaseUrl getter with validation\n");

try {
  const { env } = require("../lib/config/env");
  
  // Test 1: Access supabaseUrl (should work with valid env var)
  console.log("Test 1: Access env.supabaseUrl (with validation)");
  const url = env.supabaseUrl;
  console.log(`   ✅ Passed: Returned value (${url.substring(0, 30)}...)`);
  
  // Test 2: Access supabaseAnonKey (should still work without validation)
  console.log("\nTest 2: Access env.supabaseAnonKey (no validation yet)");
  const key = env.supabaseAnonKey;
  console.log(`   ✅ Passed: Returned value (${key ? key.substring(0, 30) + '...' : 'empty'})`);
  
  console.log("\n✅ Step 9b PASSED: supabaseUrl getter works with validation\n");
  
} catch (error) {
  console.error("❌ FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
}

