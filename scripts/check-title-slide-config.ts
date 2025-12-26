/**
 * Check title-slide configuration in database
 */

import dotenv from "dotenv";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkConfig() {
  const { data, error } = await supabase
    .from("slide_type_configs")
    .select("*")
    .eq("type_key", "title-slide")
    .single();

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Title-slide config:");
  console.log("Fields:", data.form_config.fields.map((f: any) => f.fieldId));
  console.log("Validation Rules:", JSON.stringify(data.form_config.validationRules, null, 2));
}

checkConfig();

