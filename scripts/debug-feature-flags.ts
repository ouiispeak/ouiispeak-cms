/**
 * Debug Feature Flags
 * 
 * Check what the feature flags are actually set to
 */

import dotenv from "dotenv";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

console.log("🔍 Feature Flag Debug\n");
console.log("=".repeat(60));

const useDynamicForm = process.env.NEXT_PUBLIC_USE_DYNAMIC_FORM;
const dynamicFormTypes = process.env.NEXT_PUBLIC_DYNAMIC_FORM_TYPES;

console.log(`NEXT_PUBLIC_USE_DYNAMIC_FORM: "${useDynamicForm}"`);
console.log(`  → Evaluates to: ${useDynamicForm === "true"}`);
console.log(`\nNEXT_PUBLIC_DYNAMIC_FORM_TYPES: "${dynamicFormTypes}"`);
console.log(`  → Split: [${(dynamicFormTypes || "").split(",").map(t => `"${t.trim()}"`).join(", ")}]`);

const types = (dynamicFormTypes || "")
  .split(",")
  .map(type => type.trim())
  .filter(Boolean);

console.log(`\n📋 Feature Flag Logic:`);
console.log(`  USE_DYNAMIC_SLIDE_FORM: ${useDynamicForm === "true"}`);
console.log(`  DYNAMIC_FORM_TYPES.length: ${types.length}`);
console.log(`  All types enabled: ${types.length === 0}`);

console.log(`\n🧪 Test Results:`);
const testTypes = ["text-slide", "title-slide", "ai-speak-repeat", "speech-match"];

testTypes.forEach(type => {
  const shouldUse = useDynamicForm === "true" && (types.length === 0 || types.includes(type));
  console.log(`  ${type}: ${shouldUse ? "✅ YES" : "❌ NO"}`);
});

console.log("\n" + "=".repeat(60));
console.log("\n💡 If flags look correct but forms aren't showing:");
console.log("   1. Restart dev server (env vars cached at startup)");
console.log("   2. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)");
console.log("   3. Check browser console for errors");
console.log("   4. Verify slideType is set correctly in component\n");

