import { uiTokens } from "../../../lib/uiTokens";

interface SaveMessageProps {
  message: string | null;
}

/**
 * Standardized save message display component.
 * Renders success/error/info messages with consistent styling across editors.
 * 
 * Error detection: checks if message contains "error", "failed", or "invalid" (case-insensitive).
 */
export default function SaveMessage({ message }: SaveMessageProps) {
  if (!message) {
    return null;
  }

  // Conservative error detection
  const lowerMessage = message.toLowerCase();
  const isError = lowerMessage.includes("error") || lowerMessage.includes("failed") || lowerMessage.includes("invalid");

  return (
    <p
      style={{
        margin: 0,
        marginTop: uiTokens.space.md,
        color: isError ? uiTokens.color.danger : uiTokens.color.text,
      }}
    >
      {message}
    </p>
  );
}

