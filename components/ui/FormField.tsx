import { ReactNode, cloneElement, isValidElement, useState } from "react";
import { uiTokens } from "../../lib/uiTokens";

interface FormFieldProps {
  label: string | ReactNode;
  children: ReactNode;
  helper?: ReactNode;
  required?: boolean;
  borderColor?: string;
  infoTooltip?: string;
}

export default function FormField({ label, children, helper, required, borderColor, infoTooltip }: FormFieldProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Clone children and pass borderColor prop only if it's a custom component (not a native DOM element)
  // Native DOM elements have a string type (e.g., 'div', 'label', 'input')
  // Custom components have a function or object type
  const childrenWithProps = borderColor && isValidElement(children) && typeof (children as React.ReactElement).type !== 'string'
    ? cloneElement(children as React.ReactElement<any>, { borderColor })
    : children;
  
  const infoButtonColor = "#d7a592";
  
  return (
    <div style={{ marginBottom: uiTokens.space.md }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: uiTokens.space.xs,
          marginBottom: 6,
          fontSize: uiTokens.font.label.size,
          fontWeight: 400,
          color: uiTokens.color.text,
          position: "relative",
        }}
      >
        <span>{label}</span>
        {required && <span style={{ color: uiTokens.color.danger }}> *</span>}
        {infoTooltip && (
          <div style={{ position: "relative", display: "inline-flex" }}>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                color: infoButtonColor,
                opacity: 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#d7a592"
                style={{
                  width: 16,
                  height: 16,
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
            </button>
            {showTooltip && (
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  left: "100%",
                  marginLeft: 12,
                  padding: `${uiTokens.space.sm}px ${uiTokens.space.md}px`,
                  backgroundColor: "#333",
                  color: "#fff",
                  fontSize: uiTokens.font.meta.size,
                  borderRadius: uiTokens.radius.sm,
                  whiteSpace: "pre-line",
                  minWidth: "300px",
                  maxWidth: "500px",
                  zIndex: 1000,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  pointerEvents: "none",
                }}
              >
                {infoTooltip}
                <div
                  style={{
                    position: "absolute",
                    right: "100%",
                    top: 8,
                    width: 0,
                    height: 0,
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderRight: "6px solid #333",
                  }}
                />
              </div>
            )}
          </div>
        )}
      </label>
      {childrenWithProps}
      {helper && (
        <p
          style={{
            marginTop: 4,
            marginBottom: 0,
            fontSize: uiTokens.font.meta.size,
            fontWeight: uiTokens.font.meta.weight,
            color: uiTokens.color.mutedText,
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

