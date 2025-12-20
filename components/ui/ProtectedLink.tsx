"use client";

import Link from "next/link";
import { ReactNode, MouseEvent } from "react";

interface ProtectedLinkProps {
  href: string;
  children: ReactNode;
  hasUnsavedChanges: boolean;
  onNavigate?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Link component that checks for unsaved changes before navigation
 */
export default function ProtectedLink({
  href,
  children,
  hasUnsavedChanges,
  onNavigate,
  className,
  style,
}: ProtectedLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) {
        e.preventDefault();
        return false;
      }
    }
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </Link>
  );
}

