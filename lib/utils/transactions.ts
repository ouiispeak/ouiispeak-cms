/**
 * Tier 2.2 Step 1: Transaction Utilities
 * 
 * Provides utilities for executing database operations within transactions.
 * Uses Supabase RPC (Remote Procedure Call) to execute PostgreSQL functions
 * that wrap operations in transactions for atomicity.
 */

import { supabase } from "../supabase";

/**
 * Result type for transaction operations
 */
export type TransactionResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Tier 2.2 Step 1: Execute a database transaction via RPC
 * 
 * Calls a PostgreSQL function that executes operations within a transaction.
 * If any operation fails, the entire transaction is rolled back.
 * 
 * @param functionName - Name of the PostgreSQL function to call
 * @param params - Parameters to pass to the function
 * @returns Promise resolving to TransactionResult
 * 
 * @example
 * ```ts
 * const result = await executeTransaction('delete_module', { module_id: '123' });
 * if (result.error) {
 *   console.error('Transaction failed:', result.error);
 * }
 * ```
 */
export async function executeTransaction<T = unknown>(
  functionName: string,
  params: Record<string, unknown> = {}
): Promise<TransactionResult<T>> {
  try {
    const { data, error } = await supabase.rpc(functionName, params);

    if (error) {
      return {
        data: null,
        error: error.message || `Transaction failed: ${functionName}`,
      };
    }

    return {
      data: data as T,
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown transaction error";
    return {
      data: null,
      error: errorMessage,
    };
  }
}

/**
 * Helper to convert transaction result to standard result format
 * Used for compatibility with existing deletion functions
 */
export function transactionResultToStandard<T>(
  transactionResult: TransactionResult<T>
): { data: T | null; error: string | null } {
  return {
    data: transactionResult.data,
    error: transactionResult.error,
  };
}

