"use client";

import { useParams } from "next/navigation";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import { uiTokens } from "../../../lib/uiTokens";

export default function ModuleLessonsPage() {
  const params = useParams<{ moduleId: string }>();
  const moduleId = params?.moduleId;

  return (
    <CmsPageShell>
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
          <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #deb4a5", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentModuleId={moduleId} />
        </div>
        
        {/* Right column - content */}
        <div style={{ flex: 1 }}>
          {/* Content will go here */}
        </div>
      </div>
    </CmsPageShell>
  );
}

