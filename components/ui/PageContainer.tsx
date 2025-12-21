import { ReactNode } from "react";

type MaxWidthPreset = "sm" | "md" | "lg";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: number | MaxWidthPreset;
  style?: React.CSSProperties;
}

const maxWidthPresets: Record<MaxWidthPreset, number> = {
  sm: 600,
  md: 720,
  lg: 900,
};

export default function PageContainer({
  children,
  maxWidth,
  style,
}: PageContainerProps) {
  const maxWidthValue =
    typeof maxWidth === "string" ? maxWidthPresets[maxWidth] : maxWidth;

  return (
    <main
      style={{
        padding: 0,
        ...(maxWidthValue && {
          maxWidth: maxWidthValue,
          marginLeft: "auto",
          marginRight: "auto",
        }),
        ...style,
      }}
    >
      {children}
    </main>
  );
}
