"use client";

import { useParams, usePathname } from "next/navigation";
import TopNav from "./TopNav";
import LocationSpine from "./LocationSpine";

export default function TopNavStack() {
  const pathname = usePathname();
  const params = useParams<{
    moduleId?: string;
    lessonId?: string;
    groupId?: string;
    slideId?: string;
    level?: string;
  }>();

  // Do not show the LocationSpine on CEFR standards/info pages (e.g., /cefr/a0/standards)
  const shouldShowLocationSpine = !pathname.startsWith("/cefr/");

  return (
    <>
      <TopNav />
      {shouldShowLocationSpine && (
        <LocationSpine
          moduleId={params?.moduleId}
          lessonId={params?.lessonId}
          groupId={params?.groupId}
          slideId={params?.slideId}
          level={params?.level}
        />
      )}
    </>
  );
}
