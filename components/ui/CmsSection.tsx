import { ReactNode } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface CmsSectionProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  headerSpacing?: number | string;
  children: ReactNode;
}

export default function CmsSection({
  title,
  description,
  actions,
  footer,
  backgroundColor,
  borderColor,
  headerSpacing,
  children,
}: CmsSectionProps) {
  const resolvedHeaderSpacing =
    headerSpacing === undefined
      ? undefined
      : typeof headerSpacing === "number"
      ? `${headerSpacing}px`
      : headerSpacing;
  const hasHeader = Boolean(title || description || actions);

  return (
    <div
      style={{
        display: "flow-root",
        borderRadius: uiTokens.radius.lg,
        padding: uiTokens.space.md,
        marginBottom: uiTokens.space.lg,
        background: backgroundColor || uiTokens.color.surface,
        border: borderColor ? `1px solid ${borderColor}` : undefined,
      }}
    >
      {/* Section Header */}
      {hasHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: uiTokens.space.md,
            marginBottom: headerSpacing === undefined ? uiTokens.space.md : 0,
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
      <div style={{ paddingTop: hasHeader ? resolvedHeaderSpacing : undefined }}>
        {children}
      </div>

      {/* Section Footer */}
      {footer && (
        <div
          style={{
            marginTop: uiTokens.space.lg,
            display: "flex",
            justifyContent: "flex-end",
            gap: uiTokens.space.xs,
            paddingTop: uiTokens.space.md,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
