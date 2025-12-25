"use client";

import Link from "next/link";
import CmsPageShell from "../../../components/cms/CmsPageShell";
import CmsSection from "../../../components/ui/CmsSection";
import { uiTokens } from "../../../lib/uiTokens";
import LinkButton from "../../../components/ui/LinkButton";

export default function SlideTypesPage() {
  return (
    <CmsPageShell title="Slide Types">
      <CmsSection
        backgroundColor="#e6f1f1"
        borderColor="#b4d5d5"
        title="Slide Type Configuration"
        description="Configure which fields are available for each slide type. Start with Default to control which fields can be used by all slide types."
      >
        <div
          style={{
            border: `1px solid ${uiTokens.color.border}`,
            borderRadius: uiTokens.radius.md,
            padding: uiTokens.space.md,
            backgroundColor: uiTokens.color.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>Default</div>
            <div className="metaText" style={{ color: uiTokens.color.textMuted }}>
              Controls which fields are available to all child slide types
            </div>
          </div>
          <LinkButton
            href="/cms/slide-types/default"
            size="sm"
            style={{
              color: "#e6f1f1",
              border: "none",
            }}
            aria-label="Edit Default slide type"
          >
            Edit Default
          </LinkButton>
        </div>
      </CmsSection>
    </CmsPageShell>
  );
}
