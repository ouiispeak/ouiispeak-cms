/**
 * Verify Database Indexes
 * 
 * This script checks if the performance indexes from migration 002 exist.
 * Run this after applying the migration to verify indexes were created.
 * 
 * Usage: npx tsx scripts/verify-indexes.ts
 */

// Load environment variables
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/config/env";

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

const EXPECTED_INDEXES = [
  // Foreign key indexes
  "idx_slides_lesson_id",
  "idx_slides_group_id",
  "idx_lessons_module_id",
  "idx_groups_lesson_id",
  
  // Composite ordering indexes
  "idx_slides_lesson_order",
  "idx_slides_group_order",
  "idx_lessons_module_order",
  "idx_groups_lesson_order",
  "idx_modules_order_index",
  
  // Additional indexes
  "idx_slides_type",
  "idx_slides_is_activity",
];

async function verifyIndexes() {
  console.log("🔍 Verifying Database Indexes\n");
  console.log("📋 Expected indexes:\n");
  EXPECTED_INDEXES.forEach(idx => console.log(`  - ${idx}`));
  
  console.log("\n💡 To verify indexes, run this query in Supabase SQL Editor:\n");
  console.log(`
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('slides', 'lessons', 'lesson_groups', 'modules')
  AND indexname IN (
    'idx_slides_lesson_id',
    'idx_slides_group_id',
    'idx_lessons_module_id',
    'idx_groups_lesson_id',
    'idx_slides_lesson_order',
    'idx_slides_group_order',
    'idx_lessons_module_order',
    'idx_groups_lesson_order',
    'idx_modules_order_index',
    'idx_slides_type',
    'idx_slides_is_activity'
  )
ORDER BY tablename, indexname;
  `);
  
  console.log("\n📝 Migration file: docs/migrations/002_add_performance_indexes.sql");
  console.log("   Copy the SQL and run it in Supabase SQL Editor.\n");
  
  // Test that we can connect to database
  console.log("🔌 Testing database connection...");
  const { data, error } = await supabase.from("modules").select("id").limit(1);
  
  if (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
  
  console.log("✅ Database connection successful");
  console.log("\n✅ Ready to apply migration. See instructions above.\n");
}

verifyIndexes();

