/**
 * Component for displaying slide form loading and error states
 */

import React from "react";
import { uiTokens } from "../../lib/uiTokens";
import type { SlideFormLoadState } from "../../lib/hooks/slides/useSlideFormData";

interface SlideFormLoaderProps {
  loadState: SlideFormLoadState;
}

export function SlideFormLoader({ loadState }: SlideFormLoaderProps) {
  if (loadState.status === "loading") {
    return <p style={{ padding: uiTokens.space.md }}>Loading slide data...</p>;
  }

  if (loadState.status === "error") {
    return (
      <p style={{ padding: uiTokens.space.md, color: uiTokens.color.danger }}>
        {loadState.message}
      </p>
    );
  }

  return null;
}

