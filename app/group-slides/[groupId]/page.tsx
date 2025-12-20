"use client";

import { useParams } from "next/navigation";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsOutlineView from "../../../components/cms/CmsOutlineView";
import { uiTokens } from "../../../lib/uiTokens";

export default function GroupSlidesPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params?.groupId;

  return (
    <CmsPageShell>
      <div style={{ display: "flex", gap: uiTokens.space.lg, width: "100%", minHeight: "100vh" }}>
        {/* Left column - outline view */}
          <div style={{ flex: "0 0 25%", backgroundColor: "transparent", border: "1px solid #f2e1db", borderRadius: uiTokens.radius.lg, overflow: "auto" }}>
          <CmsOutlineView currentGroupId={groupId} />
        </div>
        
        {/* Right column - content */}
        <div style={{ flex: 1 }}>
          {/* Content will go here */}
        </div>
      </div>
    </CmsPageShell>
  );
}

