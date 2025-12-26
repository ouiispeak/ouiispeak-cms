/**
 * Hook to fetch slide type configuration
 * 
 * Fetches the configuration for a given slide type from the database.
 * Uses React Query or SWR pattern for caching and revalidation.
 * 
 * Usage:
 *   const { config, loading, error } = useSlideTypeConfig("text-slide");
 */

"use client";

import { useState, useEffect } from "react";
import { getSlideTypeConfig } from "../data/slideTypeConfigs";
import type { SlideTypeConfig } from "../schemas/slideTypeConfig";

interface UseSlideTypeConfigResult {
  config: SlideTypeConfig | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and cache slide type configuration
 * 
 * @param typeKey - The slide type key (e.g., "text-slide", "ai-speak-student-repeat")
 * @returns Object with config, loading state, and error
 */
export function useSlideTypeConfig(typeKey: string | null | undefined): UseSlideTypeConfigResult {
  const [config, setConfig] = useState<SlideTypeConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when typeKey changes
    setConfig(null);
    setError(null);
    setLoading(true);

    // Don't fetch if typeKey is not provided
    if (!typeKey) {
      setLoading(false);
      setError("No slide type provided");
      return;
    }

    // Fetch configuration
    getSlideTypeConfig(typeKey)
      .then((result) => {
        if (result.error) {
          setError(result.error);
          setConfig(null);
        } else {
          setConfig(result.data);
          setError(null);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load configuration");
        setConfig(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [typeKey]);

  return { config, loading, error };
}

