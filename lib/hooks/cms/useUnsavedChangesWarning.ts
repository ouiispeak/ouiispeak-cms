import { useEffect, useRef } from "react";

/**
 * Hook to warn users before navigating away with unsaved changes
 * 
 * @param hasUnsavedChanges - Boolean indicating if there are unsaved changes
 * @param message - Optional custom warning message (default: browser's default)
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean, message?: string) {
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

  // Keep ref in sync
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  useEffect(() => {
    // Handle browser navigation (refresh, close tab, external links, etc.)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        e.preventDefault();
        // Modern browsers ignore custom messages and show their own
        e.returnValue = message || "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [message]);

  /**
   * Check if navigation should be blocked due to unsaved changes
   * Returns true if navigation should proceed, false if cancelled
   */
  const checkBeforeNavigate = (): boolean => {
    if (hasUnsavedChangesRef.current) {
      return window.confirm(
        message || "You have unsaved changes. Are you sure you want to leave?"
      );
    }
    return true;
  };

  return { checkBeforeNavigate };
}
