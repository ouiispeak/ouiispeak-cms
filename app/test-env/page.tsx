"use client";

/**
 * Test Step 6: Does the getter work in browser/client-side?
 * 
 * This page will try to access env.supabaseUrl in a client component.
 * If it fails, we'll see the exact error.
 */

import { env } from "../../lib/config/env";
import { useEffect, useState } from "react";

export default function TestEnvPage() {
  const [result, setResult] = useState<{
    status: "loading" | "success" | "error";
    value?: string;
    error?: string;
  }>({ status: "loading" });

  useEffect(() => {
    try {
      // Step 9c: Test both getters WITH validation
      const url = env.supabaseUrl; // Has validation
      const key = env.supabaseAnonKey; // Now has validation too
      
      setResult({
        status: "success",
        value: `URL (validated): ${url.substring(0, 30)}... | Key (validated): ${key.substring(0, 20)}...`,
      });
    } catch (error) {
      setResult({
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>🧪 Step 9c Test: Both Getters WITH Validation</h1>
      
      {result.status === "loading" && <p>Loading...</p>}
      
      {result.status === "success" && (
        <div style={{ color: "green" }}>
          <h2>✅ SUCCESS</h2>
          <p>Getter returned: {result.value}</p>
          <p>Step 9c PASSED: Both getters with validation work in browser!</p>
        </div>
      )}
      
      {result.status === "error" && (
        <div style={{ color: "red" }}>
          <h2>❌ FAILED</h2>
          <pre style={{ background: "#f5f5f5", padding: "1rem", overflow: "auto" }}>
            {result.error}
          </pre>
          <p><strong>This is where the problem occurs!</strong></p>
        </div>
      )}
    </div>
  );
}

