/**
 * Test Step 1: Can we import empty env.ts without errors?
 */

console.log("🧪 Testing Step 1: Import empty env.ts\n");

try {
  // Try to import the file (using require for compatibility)
  const envModule = require("../lib/config/env");
  console.log("✅ SUCCESS: env.ts imported without errors");
  console.log(`   Module contents:`, Object.keys(envModule));
  console.log("\n✅ Step 1 PASSED: File structure is valid\n");
} catch (error) {
  console.error("❌ FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
}

