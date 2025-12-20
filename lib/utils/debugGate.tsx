"use client";

import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";

/**
 * Debug route gate component
 * Prevents debug/authoring routes from being accessible in production
 * 
 * Requirements:
 * - NEXT_PUBLIC_ENABLE_DEBUG=true must be set
 * - TODO: Add authentication check if needed for additional security
 * 
 * Usage:
 * ```tsx
 * if (!isDebugEnabled()) {
 *   return <DebugGate />;
 * }
 * ```
 */
export function isDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";
}

export function DebugGate() {
  return (
    <PageShell title="Not Found" maxWidth="md">
      <CmsSection title="404 - Page Not Found">
        <p>This page is not available.</p>
        <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "8px" }}>
          Debug routes require <code>NEXT_PUBLIC_ENABLE_DEBUG=true</code> to be enabled.
        </p>
      </CmsSection>
    </PageShell>
  );
}

