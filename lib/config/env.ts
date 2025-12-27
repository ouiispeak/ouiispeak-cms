/**
 * Environment Variable Access
 * 
 * Step 9a: Add validation function (test separately, don't use in getters yet)
 */

/**
 * Validate that a required environment variable exists
 * 
 * @param name - Environment variable name
 * @param value - The value to validate
 * @throws Error if value is missing or empty
 */
function validateRequiredEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    const isBrowser = typeof window !== 'undefined';
    const hint = isBrowser
      ? 'The env var was not available when Next.js built the client bundle. Make sure .env.local exists and restart the dev server.'
      : 'Make sure .env.local exists in the project root and restart the dev server.';
    
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `${hint}\n` +
      `Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY`
    );
  }
  
  return value;
}

export const env = {
  // Step 9b: supabaseUrl getter with validation
  get supabaseUrl() {
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return validateRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL', value);
  },
  // Step 9c: Add validation to supabaseAnonKey getter
  get supabaseAnonKey() {
    const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return validateRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', value);
  },
};

// Export validation function for testing
export { validateRequiredEnvVar };

