import { supabase } from "../supabase";

export interface StorageItem {
  name: string;
  isFolder: boolean;
  fullPath: string;
}

/**
 * List items (files and folders) from Supabase Storage
 * @param bucketName - Name of the storage bucket
 * @param folderPath - Folder path within the bucket (empty string for root)
 */
export async function listStorageItems(
  bucketName: string,
  folderPath: string = ""
): Promise<{ data: StorageItem[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      return { data: null, error: error.message };
    }

    const items: StorageItem[] = (data || [])
      .filter((item) => item.name) // Filter out invalid items
      .map((item) => {
        // Determine if it's a folder
        // In Supabase Storage, folders are typically identified by:
        // - Having null id, OR
        // - Having no updated_at timestamp, OR  
        // - Being a prefix (ending with /) - but Supabase doesn't return this
        // The most reliable way is to check if updated_at is null/undefined
        const isFolder = item.id === null || !item.updated_at || (item.metadata && Object.keys(item.metadata).length === 0);
        
        // Build full path from bucket root
        const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name;
        
        return {
          name: item.name,
          isFolder,
          fullPath,
        };
      })
      .sort((a, b) => {
        // Folders first, then files, both alphabetically
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });

    return { data: items, error: null };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to list storage items";
    return { data: null, error: errorMessage };
  }
}

/**
 * Get public URL for an audio file in Supabase Storage
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path to the file within the bucket
 */
export function getAudioFileUrl(
  bucketName: string,
  filePath: string
): string {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

