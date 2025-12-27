/**
 * Test Step 9c: Do both getters work with validation?
 */

// Load env vars
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

console.log("🧪 Testing Step 9c: Both getters with validation\n");

try {
  const { env } = require("../lib/config/env");
  
  // Test 1: Access supabaseUrl (with validation)
  console.log("Test 1: Access env.supabaseUrl (with validation)");
  const url = env.supabaseUrl;
  console.log(`   ✅ Passed: Returned value (${url.substring(0, 30)}...)`);
  
  // Test 2: Access supabaseAnonKey (now with validation)
  console.log("\nTest 2: Access env.supabaseAnonKey (now with validation)");
  const key = env.supabaseAnonKey;
  console.log(`   ✅ Passed: Returned value (${key.substring(0, 30)}...)`);
  
  console.log("\n✅ Step 9c PASSED: Both getters work with validation\n");
  
} catch (error) {
  console.error("❌ FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
}

