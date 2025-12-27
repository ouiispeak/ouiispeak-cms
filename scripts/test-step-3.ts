/**
 * Test Step 3: Does simple getter work in Node.js script?
 */

// Load env vars
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

console.log("🧪 Testing Step 3: Simple getter (no validation)\n");

try {
  const { env } = require("../lib/config/env");
  
  console.log("Test 1: Access env.supabaseUrl");
  const url = env.supabaseUrl;
  console.log(`   Value: ${url ? url.substring(0, 30) + '...' : 'empty/undefined'}`);
  
  if (!url) {
    console.error("   ❌ FAILED: getter returned empty/undefined");
    console.error("   Check: Is .env.local loaded?");
    process.exit(1);
  }
  
  console.log("   ✅ SUCCESS: getter returned a value");
  console.log("\n✅ Step 3 PASSED: Simple getter works in Node.js\n");
  
} catch (error) {
  console.error("❌ FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
}

