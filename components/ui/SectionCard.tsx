import { ReactNode } from "react";
import { border } from "../../lib/uiTokens";

interface SectionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function SectionCard({
  title,
  description,
  children,
  actions,
}: SectionCardProps) {
  return (
    <div className="mb-6 rounded-lg border p-4" style={{ borderColor: border }}>
      {(title || description || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h2 className="mt-0 mb-0 text-lg font-normal">{title}</h2>
            )}
            {description && (
              <p className="mt-1 mb-0 text-sm text-[#666]">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

