import { ReactNode } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface CmsSectionProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function CmsSection({
  title,
  description,
  actions,
  footer,
  children,
}: CmsSectionProps) {
  return (
    <div
      style={{
        border: `1px solid ${uiTokens.color.border}`,
        borderRadius: uiTokens.radius.lg,
        padding: uiTokens.space.md,
        marginBottom: uiTokens.space.lg,
        background: "transparent",
      }}
    >
      {/* Section Header */}
      {(title || description || actions) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: uiTokens.space.md,
            marginBottom: uiTokens.space.md,
          }}
        >
          <div style={{ flex: 1 }}>
            {title && (
              <h2
                style={{
                  fontSize: uiTokens.font.sectionTitle.size,
                  fontWeight: uiTokens.font.sectionTitle.weight,
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                style={{
                  fontSize: uiTokens.font.meta.size,
                  fontWeight: uiTokens.font.meta.weight,
                  color: uiTokens.color.mutedText,
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div style={{ display: "flex", gap: uiTokens.space.xs, alignItems: "center" }}>
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Section Body */}
      <div>{children}</div>

      {/* Section Footer */}
      {footer && (
        <div
          style={{
            marginTop: uiTokens.space.lg,
            display: "flex",
            justifyContent: "flex-end",
            gap: uiTokens.space.xs,
            paddingTop: uiTokens.space.md,
            borderTop: `1px solid ${uiTokens.color.borderSubtle}`,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

