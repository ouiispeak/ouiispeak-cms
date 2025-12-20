"use client";

import { useCmsContextBarData } from "./useCmsContextBarData";
import CmsContextBarView from "./CmsContextBarView";

interface CmsContextBarProps {
  moduleId?: string;
  lessonId?: string;
  groupId?: string;
  slideId?: string;
}

export default function CmsContextBar({
  moduleId,
  lessonId,
  groupId,
  slideId,
}: CmsContextBarProps) {
  const data = useCmsContextBarData({ moduleId, lessonId, groupId, slideId });

  return <CmsContextBarView {...data} />;
}

