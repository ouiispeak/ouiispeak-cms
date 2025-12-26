/**
 * Slide Type Configuration Data Layer
 * 
 * CRUD operations for slide type configurations stored in slide_type_configs table.
 * 
 * Functions follow the pattern established in lib/data/slides.ts and lib/data/groups.ts
 */

import { supabase } from "../supabase";
import type { SlideTypeConfig, SlideTypeConfigRecord, FormConfig } from "../schemas/slideTypeConfig";
import { recordToConfig, configToRecord, validateSlideTypeConfig } from "../schemas/slideTypeConfig";

/**
 * Result type for data operations
 */
export type SlideTypeConfigResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Create a new slide type configuration
 * 
 * @param config - The slide type configuration to create
 * @returns Result with created config or error
 */
export async function createSlideTypeConfig(
  config: SlideTypeConfig
): Promise<SlideTypeConfigResult<SlideTypeConfig>> {
  // Validate configuration before saving
  const validation = validateSlideTypeConfig(config);
  if (!validation.valid) {
    return {
      data: null,
      error: `Invalid configuration: ${validation.errors.join(", ")}`
    };
  }

  // Check if config with this type_key already exists
  const existing = await getSlideTypeConfig(config.typeKey);
  if (existing.data) {
    return {
      data: null,
      error: `Configuration for type "${config.typeKey}" already exists. Use updateSlideTypeConfig instead.`
    };
  }

  // Convert to database record format
  const record = configToRecord(config);

  // Insert into database
  const { data, error } = await supabase
    .from("slide_type_configs")
    .insert({
      type_key: record.type_key,
      display_name: record.display_name,
      is_active: record.is_active,
      version: record.version,
      form_config: record.form_config
    })
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: `Failed to create configuration: ${error.message}`
    };
  }

  // Convert back to SlideTypeConfig format
  const createdConfig = recordToConfig(data as SlideTypeConfigRecord);
  return { data: createdConfig, error: null };
}

/**
 * Get a slide type configuration by type key
 * 
 * @param typeKey - The type key (e.g., "ai-speak-student-repeat")
 * @returns Result with config or error
 */
export async function getSlideTypeConfig(
  typeKey: string
): Promise<SlideTypeConfigResult<SlideTypeConfig>> {
  const { data, error } = await supabase
    .from("slide_type_configs")
    .select("*")
    .eq("type_key", typeKey)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: `Failed to load configuration: ${error.message}`
    };
  }

  if (!data) {
    return {
      data: null,
      error: `No configuration found for type "${typeKey}"`
    };
  }

  const config = recordToConfig(data as SlideTypeConfigRecord);
  return { data: config, error: null };
}

/**
 * Get a slide type configuration by type key (only if active)
 * 
 * @param typeKey - The type key (e.g., "ai-speak-student-repeat")
 * @returns Result with config or error
 */
export async function getActiveSlideTypeConfig(
  typeKey: string
): Promise<SlideTypeConfigResult<SlideTypeConfig>> {
  const { data, error } = await supabase
    .from("slide_type_configs")
    .select("*")
    .eq("type_key", typeKey)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: `Failed to load configuration: ${error.message}`
    };
  }

  if (!data) {
    return {
      data: null,
      error: `No active configuration found for type "${typeKey}"`
    };
  }

  const config = recordToConfig(data as SlideTypeConfigRecord);
  return { data: config, error: null };
}

/**
 * Update an existing slide type configuration
 * 
 * @param typeKey - The type key to update
 * @param updates - Partial configuration updates
 * @returns Result with updated config or error
 */
export async function updateSlideTypeConfig(
  typeKey: string,
  updates: Partial<SlideTypeConfig>
): Promise<SlideTypeConfigResult<SlideTypeConfig>> {
  // Get existing config
  const existing = await getSlideTypeConfig(typeKey);
  if (existing.error || !existing.data) {
    return {
      data: null,
      error: existing.error || `Configuration for type "${typeKey}" not found`
    };
  }

  // Merge updates with existing config
  const updatedConfig: SlideTypeConfig = {
    ...existing.data,
    ...updates,
    // Ensure formConfig is merged properly if provided
    formConfig: updates.formConfig || existing.data.formConfig,
    // Increment version if formConfig changed
    version: updates.formConfig ? existing.data.version + 1 : existing.data.version
  };

  // Validate updated configuration
  const validation = validateSlideTypeConfig(updatedConfig);
  if (!validation.valid) {
    return {
      data: null,
      error: `Invalid configuration: ${validation.errors.join(", ")}`
    };
  }

  // Convert to database record format (id not needed for update query)
  const record = configToRecord(updatedConfig);

  // Update in database
  const { data, error } = await supabase
    .from("slide_type_configs")
    .update({
      display_name: record.display_name,
      is_active: record.is_active,
      version: record.version,
      form_config: record.form_config,
      updated_at: new Date().toISOString()
    })
    .eq("type_key", typeKey)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: `Failed to update configuration: ${error.message}`
    };
  }

  // Convert back to SlideTypeConfig format
  const updated = recordToConfig(data as SlideTypeConfigRecord);
  return { data: updated, error: null };
}

/**
 * List all slide type configurations
 * 
 * @param includeInactive - Whether to include inactive configurations (default: false)
 * @returns Result with array of configs or error
 */
export async function listSlideTypeConfigs(
  includeInactive: boolean = false
): Promise<SlideTypeConfigResult<SlideTypeConfig[]>> {
  let query = supabase
    .from("slide_type_configs")
    .select("*")
    .order("display_name", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    return {
      data: null,
      error: `Failed to list configurations: ${error.message}`
    };
  }

  const configs = (data || []).map((record) =>
    recordToConfig(record as SlideTypeConfigRecord)
  );

  return { data: configs, error: null };
}

/**
 * Delete a slide type configuration
 * 
 * @param typeKey - The type key to delete
 * @returns Result with error if deletion failed
 */
export async function deleteSlideTypeConfig(
  typeKey: string
): Promise<SlideTypeConfigResult<null>> {
  const { error } = await supabase
    .from("slide_type_configs")
    .delete()
    .eq("type_key", typeKey);

  if (error) {
    return {
      data: null,
      error: `Failed to delete configuration: ${error.message}`
    };
  }

  return { data: null, error: null };
}

/**
 * Deactivate a slide type configuration (soft delete)
 * 
 * @param typeKey - The type key to deactivate
 * @returns Result with updated config or error
 */
export async function deactivateSlideTypeConfig(
  typeKey: string
): Promise<SlideTypeConfigResult<SlideTypeConfig>> {
  return updateSlideTypeConfig(typeKey, { isActive: false });
}

/**
 * Activate a slide type configuration
 * 
 * @param typeKey - The type key to activate
 * @returns Result with updated config or error
 */
export async function activateSlideTypeConfig(
  typeKey: string
): Promise<SlideTypeConfigResult<SlideTypeConfig>> {
  return updateSlideTypeConfig(typeKey, { isActive: true });
}

/**
 * Check if a configuration exists and is active
 * 
 * @param typeKey - The type key to check
 * @returns True if active configuration exists, false otherwise
 */
export async function isConfigActive(typeKey: string): Promise<boolean> {
  const result = await getActiveSlideTypeConfig(typeKey);
  return result.data !== null && result.error === null;
}

/**
 * Get the latest version number for a slide type configuration
 * 
 * @param typeKey - The type key to check
 * @returns Version number or 0 if not found
 */
export async function getLatestConfigVersion(typeKey: string): Promise<number> {
  const result = await getSlideTypeConfig(typeKey);
  if (result.data) {
    return result.data.version;
  }
  return 0;
}

/**
 * Update only the form_config for a slide type (increments version)
 * 
 * @param typeKey - The type key to update
 * @param formConfig - The new form configuration
 * @returns Result with updated config or error
 */
export async function updateFormConfig(
  typeKey: string,
  formConfig: FormConfig
): Promise<SlideTypeConfigResult<SlideTypeConfig>> {
  // Get existing config
  const existing = await getSlideTypeConfig(typeKey);
  if (existing.error || !existing.data) {
    return {
      data: null,
      error: existing.error || `Configuration for type "${typeKey}" not found`
    };
  }

  // Create updated config with new formConfig and incremented version
  const updatedConfig: SlideTypeConfig = {
    ...existing.data,
    formConfig,
    version: existing.data.version + 1
  };

  // Validate
  const validation = validateSlideTypeConfig(updatedConfig);
  if (!validation.valid) {
    return {
      data: null,
      error: `Invalid form configuration: ${validation.errors.join(", ")}`
    };
  }

  // Update
  return updateSlideTypeConfig(typeKey, updatedConfig);
}

