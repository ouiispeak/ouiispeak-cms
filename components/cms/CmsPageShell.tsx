"use client";

import { ReactNode } from "react";
import PageShell from "../ui/PageShell";
import { useParams } from "next/navigation";

interface CmsPageShellProps {
  title?: string;
  showBack?: boolean;
  backLabel?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | number;
  children: ReactNode;
}

export default function CmsPageShell({
  title,
  showBack = false,
  backLabel,
  meta,
  actions,
  maxWidth,
  children,
}: CmsPageShellProps) {
  const params = useParams<{
    moduleId?: string;
    lessonId?: string;
    groupId?: string;
    slideId?: string;
    level?: string;
  }>();

  return (
    <>
      <PageShell
        title={title}
        showBack={showBack}
        backLabel={backLabel}
        meta={meta}
        actions={actions}
        maxWidth={maxWidth}
      >
        {children}
      </PageShell>
    </>
  );
}
