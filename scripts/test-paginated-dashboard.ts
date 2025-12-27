/**
 * Tier 2.1 Step 3 Test: Paginated Dashboard Data Loader
 * 
 * Tests: Does loadDashboardDataPaginated() work correctly?
 */

// Load environment variables
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { loadDashboardDataPaginated } from "../lib/data/dashboard";

async function testPaginatedDashboard() {
  console.log("🧪 Step 3 Test: Paginated Dashboard Data Loader");
  console.log("");

  try {
    // Test page 1, pageSize 10
    console.log("Testing page 1, pageSize 10...");
    const result1 = await loadDashboardDataPaginated(1, 10);
    
    if (result1.error) {
      console.log("❌ ERROR:", result1.error);
      process.exit(1);
    }

    if (!result1.data || !result1.meta) {
      console.log("❌ ERROR: Missing data or meta");
      process.exit(1);
    }

    console.log(`✅ SUCCESS`);
    console.log(`   Modules loaded: ${result1.data.modules.length}`);
    console.log(`   Lessons loaded: ${result1.data.lessons.length}`);
    console.log(`   Groups loaded: ${result1.data.groups.length}`);
    console.log(`   Slides loaded: ${result1.data.slides.length}`);
    console.log(`   Page: ${result1.meta.page}`);
    console.log(`   Page Size: ${result1.meta.pageSize}`);
    console.log(`   Total Modules: ${result1.meta.total}`);
    console.log(`   Total Pages: ${result1.meta.totalPages}`);
    console.log(`   Has More: ${result1.meta.hasMore}`);
    console.log("");

    // Verify hierarchy is maintained
    console.log("Verifying hierarchy...");
    let hierarchyValid = true;
    
    // Check that all lessons belong to loaded modules
    const moduleIds = new Set(result1.data.modules.map(m => m.id));
    const invalidLessons = result1.data.lessons.filter(l => !moduleIds.has(l.moduleId));
    if (invalidLessons.length > 0) {
      console.log(`❌ ERROR: Found ${invalidLessons.length} lessons not belonging to loaded modules`);
      hierarchyValid = false;
    }

    // Check that all groups belong to loaded lessons
    const lessonIds = new Set(result1.data.lessons.map(l => l.id));
    const invalidGroups = result1.data.groups.filter(g => !lessonIds.has(g.lessonId));
    if (invalidGroups.length > 0) {
      console.log(`❌ ERROR: Found ${invalidGroups.length} groups not belonging to loaded lessons`);
      hierarchyValid = false;
    }

    // Check that all slides belong to loaded lessons
    const invalidSlides = result1.data.slides.filter(s => !lessonIds.has(s.lessonId));
    if (invalidSlides.length > 0) {
      console.log(`❌ ERROR: Found ${invalidSlides.length} slides not belonging to loaded lessons`);
      hierarchyValid = false;
    }

    if (!hierarchyValid) {
      process.exit(1);
    }

    console.log("✅ Hierarchy verified: All children belong to loaded parents");
    console.log("");

    // Test page 2 if available
    if (result1.meta.totalPages > 1) {
      console.log("Testing page 2...");
      const result2 = await loadDashboardDataPaginated(2, 10);
      
      if (result2.error) {
        console.log("❌ ERROR:", result2.error);
        process.exit(1);
      }

      if (!result2.data || !result2.meta) {
        console.log("❌ ERROR: Missing data or meta");
        process.exit(1);
      }

      console.log(`✅ SUCCESS`);
      console.log(`   Modules loaded: ${result2.data.modules.length}`);
      console.log(`   Page: ${result2.meta.page}`);
      console.log(`   Has More: ${result2.meta.hasMore}`);
      console.log("");
    }

    console.log("✅ Step 3 PASSED: Paginated dashboard data loader works!");
  } catch (err) {
    console.log("❌ FAILED:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

testPaginatedDashboard();

