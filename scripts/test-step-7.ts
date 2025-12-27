/**
 * Test Step 7: Do both getters work in Node.js script?
 */

// Load env vars
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

console.log("🧪 Testing Step 7: Two getters (supabaseUrl + supabaseAnonKey)\n");

try {
  const { env } = require("../lib/config/env");
  
  console.log("Test 1: Access env.supabaseUrl");
  const url = env.supabaseUrl;
  console.log(`   Value: ${url ? url.substring(0, 30) + '...' : 'empty/undefined'}`);
  
  console.log("\nTest 2: Access env.supabaseAnonKey");
  const key = env.supabaseAnonKey;
  console.log(`   Value: ${key ? key.substring(0, 30) + '...' : 'empty/undefined'}`);
  
  if (!url || !key) {
    console.error("   ❌ FAILED: One or both getters returned empty/undefined");
    process.exit(1);
  }
  
  console.log("\n   ✅ SUCCESS: Both getters returned values");
  console.log("\n✅ Step 7 PASSED: Two getters work in Node.js\n");
  
} catch (error) {
  console.error("❌ FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
}

