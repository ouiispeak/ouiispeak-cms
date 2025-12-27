/**
 * Tier 2.1 Step 1 Test: Paginated Modules Function
 * 
 * Tests: Does loadModulesPaginated() work correctly?
 */

// Load environment variables
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { loadModulesPaginated } from "../lib/data/modules";

async function testPaginatedModules() {
  console.log("🧪 Step 1 Test: Paginated Modules Function");
  console.log("");

  try {
    // Test page 1, pageSize 10
    console.log("Testing page 1, pageSize 10...");
    const result1 = await loadModulesPaginated(1, 10);
    
    if (result1.error) {
      console.log("❌ ERROR:", result1.error);
      process.exit(1);
    }

    if (!result1.data || !result1.meta) {
      console.log("❌ ERROR: Missing data or meta");
      process.exit(1);
    }

    console.log(`✅ SUCCESS`);
    console.log(`   Modules loaded: ${result1.data.length}`);
    console.log(`   Page: ${result1.meta.page}`);
    console.log(`   Page Size: ${result1.meta.pageSize}`);
    console.log(`   Total: ${result1.meta.total}`);
    console.log(`   Total Pages: ${result1.meta.totalPages}`);
    console.log(`   Has More: ${result1.meta.hasMore}`);
    console.log("");

    // Test page 2 if available
    if (result1.meta.totalPages > 1) {
      console.log("Testing page 2...");
      const result2 = await loadModulesPaginated(2, 10);
      
      if (result2.error) {
        console.log("❌ ERROR:", result2.error);
        process.exit(1);
      }

      if (!result2.data || !result2.meta) {
        console.log("❌ ERROR: Missing data or meta");
        process.exit(1);
      }

      console.log(`✅ SUCCESS`);
      console.log(`   Modules loaded: ${result2.data.length}`);
      console.log(`   Page: ${result2.meta.page}`);
      console.log(`   Has More: ${result2.meta.hasMore}`);
      console.log("");
    }

    console.log("✅ Step 1 PASSED: Paginated modules function works!");
  } catch (err) {
    console.log("❌ FAILED:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

testPaginatedModules();

