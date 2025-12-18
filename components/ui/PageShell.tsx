"use client";

import { ReactNode } from "react";
import { BackButton } from "../BackButton";
import PageContainer from "./PageContainer";
import { uiTokens } from "../../lib/uiTokens";

type MaxWidthPreset = "sm" | "md" | "lg";

interface PageShellProps {
  title: string;
  showBack?: boolean;
  backLabel?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  maxWidth?: MaxWidthPreset | number;
  children: ReactNode;
}

export default function PageShell({
  title,
  showBack = true,
  backLabel,
  meta,
  actions,
  maxWidth,
  children,
}: PageShellProps) {
  return (
    <>
      {/* Page Header */}
      <div
        style={{
          padding: `${uiTokens.space.md}px ${uiTokens.space.lg}px`,
          borderBottom: `1px solid ${uiTokens.color.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontSize: uiTokens.font.pageTitle.size,
            fontWeight: uiTokens.font.pageTitle.weight,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {actions && (
          <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center" }}>
            {actions}
          </div>
        )}
      </div>

      {/* Back Button Row */}
      {showBack && (
        <div
          style={{
            padding: `${uiTokens.space.md}px ${uiTokens.space.lg}px`,
            borderBottom: `1px solid ${uiTokens.color.border}`,
          }}
        >
          <BackButton title={backLabel || "Back to Dashboard"} />
        </div>
      )}

      {/* Page Container with Meta */}
      <PageContainer maxWidth={maxWidth}>
        {meta && (
          <div
            style={{
              fontSize: uiTokens.font.meta.size,
              fontWeight: uiTokens.font.meta.weight,
              color: uiTokens.color.mutedText,
              marginTop: uiTokens.space.md,
              marginBottom: uiTokens.space.lg,
            }}
          >
            {meta}
          </div>
        )}
        {children}
      </PageContainer>
    </>
  );
}

