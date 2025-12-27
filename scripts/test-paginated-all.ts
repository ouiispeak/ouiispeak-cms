/**
 * Tier 2.1 Step 2 Test: Paginated Functions (Lessons, Groups, Slides)
 * 
 * Tests: Do all paginated functions work correctly?
 */

// Load environment variables
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { loadLessonsPaginated } from "../lib/data/lessons";
import { loadGroupsPaginated } from "../lib/data/groups";
import { loadSlidesPaginated } from "../lib/data/slides";

async function testPaginatedFunctions() {
  console.log("🧪 Step 2 Test: Paginated Functions (Lessons, Groups, Slides)");
  console.log("");

  try {
    // Test Lessons
    console.log("Testing loadLessonsPaginated()...");
    const lessonsResult = await loadLessonsPaginated(1, 10);
    
    if (lessonsResult.error) {
      console.log("❌ LESSONS ERROR:", lessonsResult.error);
      process.exit(1);
    }

    if (!lessonsResult.data || !lessonsResult.meta) {
      console.log("❌ LESSONS ERROR: Missing data or meta");
      process.exit(1);
    }

    console.log(`✅ LESSONS SUCCESS`);
    console.log(`   Lessons loaded: ${lessonsResult.data.length}`);
    console.log(`   Page: ${lessonsResult.meta.page}`);
    console.log(`   Total: ${lessonsResult.meta.total}`);
    console.log(`   Total Pages: ${lessonsResult.meta.totalPages}`);
    console.log(`   Has More: ${lessonsResult.meta.hasMore}`);
    console.log("");

    // Test Groups
    console.log("Testing loadGroupsPaginated()...");
    const groupsResult = await loadGroupsPaginated(1, 10);
    
    if (groupsResult.error) {
      console.log("❌ GROUPS ERROR:", groupsResult.error);
      process.exit(1);
    }

    if (!groupsResult.data || !groupsResult.meta) {
      console.log("❌ GROUPS ERROR: Missing data or meta");
      process.exit(1);
    }

    console.log(`✅ GROUPS SUCCESS`);
    console.log(`   Groups loaded: ${groupsResult.data.length}`);
    console.log(`   Page: ${groupsResult.meta.page}`);
    console.log(`   Total: ${groupsResult.meta.total}`);
    console.log(`   Total Pages: ${groupsResult.meta.totalPages}`);
    console.log(`   Has More: ${groupsResult.meta.hasMore}`);
    console.log("");

    // Test Slides
    console.log("Testing loadSlidesPaginated()...");
    const slidesResult = await loadSlidesPaginated(1, 10);
    
    if (slidesResult.error) {
      console.log("❌ SLIDES ERROR:", slidesResult.error);
      process.exit(1);
    }

    if (!slidesResult.data || !slidesResult.meta) {
      console.log("❌ SLIDES ERROR: Missing data or meta");
      process.exit(1);
    }

    console.log(`✅ SLIDES SUCCESS`);
    console.log(`   Slides loaded: ${slidesResult.data.length}`);
    console.log(`   Page: ${slidesResult.meta.page}`);
    console.log(`   Total: ${slidesResult.meta.total}`);
    console.log(`   Total Pages: ${slidesResult.meta.totalPages}`);
    console.log(`   Has More: ${slidesResult.meta.hasMore}`);
    console.log("");

    console.log("✅ Step 2 PASSED: All paginated functions work!");
  } catch (err) {
    console.log("❌ FAILED:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

testPaginatedFunctions();

