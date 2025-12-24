import { uiTokens } from "../../../lib/uiTokens";

interface MissingLabelWarningProps {
  show: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Warning banner displayed when a slide is missing a label.
 * Used across slide editors to maintain consistent messaging.
 */
export default function MissingLabelWarning({ show, className, style }: MissingLabelWarningProps) {
  if (!show) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        padding: uiTokens.space.md,
        backgroundColor: "#fff3cd",
        border: `1px solid #ffc107`,
        borderRadius: uiTokens.radius.md,
        color: "#856404",
        ...style,
      }}
    >
      <strong>Missing label:</strong> This slide is missing a label. Please add one for proper CMS navigation.
    </div>
  );
}

