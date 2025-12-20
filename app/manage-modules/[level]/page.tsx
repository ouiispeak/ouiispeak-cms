"use client";

import { useParams } from "next/navigation";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import { uiTokens } from "../../../lib/uiTokens";

export default function ManageModulesPage() {
  const params = useParams<{ level: string }>();
  const level = params?.level;

  return (
    <CmsPageShell>
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
          <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #d09680", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentLevel={level} />
        </div>
        
        {/* Right column - content */}
        <div style={{ flex: 1 }}>
          {/* Content will go here */}
        </div>
      </div>
    </CmsPageShell>
  );
}

