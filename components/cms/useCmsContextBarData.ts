import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadModules, loadModuleById } from "../../lib/data/modules";
import type { Module } from "../../lib/domain/module";
import { loadLessonsByModule } from "../../lib/data/lessons";
import type { LessonMinimal } from "../../lib/domain/lesson";
import { loadGroupsByLesson } from "../../lib/data/groups";
import type { GroupMinimal } from "../../lib/domain/group";
import { loadSlidesByGroup, loadSlidesByLesson } from "../../lib/data/slides";
import type { SlideMinimal } from "../../lib/domain/slide";
import {
  getAncestorsForLesson,
  getAncestorsForGroup,
  getAncestorsForSlide,
  type LessonAncestors,
  type GroupAncestors,
  type SlideAncestors,
} from "../../lib/data/ancestors";

export interface CmsContextBarDataProps {
  moduleId?: string;
  lessonId?: string;
  groupId?: string;
  slideId?: string;
}

export type AncestorsState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "module"; module: Module }
  | { type: "lesson"; ancestors: LessonAncestors }
  | { type: "group"; ancestors: GroupAncestors }
  | { type: "slide"; ancestors: SlideAncestors };

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface ContextAction {
  label: string;
  href: string;
}

export interface CmsContextBarData {
  // Loading states
  loadingAncestors: boolean;
  loadingSelectors: boolean;
  
  // Ancestors state
  ancestors: AncestorsState;
  
  // Selector options
  modules: Module[];
  lessons: LessonMinimal[];
  groups: GroupMinimal[];
  slides: SlideMinimal[];
  
  // Current selected IDs
  currentModuleId?: string;
  currentLessonId?: string;
  currentGroupId?: string;
  currentSlideId?: string;
  
  // Computed UI data
  breadcrumbs: Breadcrumb[];
  contextActions: ContextAction[];
  
  // Navigation handlers
  handleModuleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleLessonChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleGroupChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSlideChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function useCmsContextBarData({
  moduleId,
  lessonId,
  groupId,
  slideId,
}: CmsContextBarDataProps): CmsContextBarData {
  const router = useRouter();

  const [ancestors, setAncestors] = useState<AncestorsState>({ type: "loading" });

  // Selector options with memoization keys
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<LessonMinimal[]>([]);
  const [groups, setGroups] = useState<GroupMinimal[]>([]);
  const [slides, setSlides] = useState<SlideMinimal[]>([]);

  // Track which IDs we've already loaded to prevent refetches
  const loadedKeysRef = useRef<{
    modules: boolean;
    lessons: string | null;
    groups: string | null;
    slides: string | null; // lessonId or groupId
  }>({
    modules: false,
    lessons: null,
    groups: null,
    slides: null,
  });

  const [loadingAncestors, setLoadingAncestors] = useState(true);
  const [loadingSelectors, setLoadingSelectors] = useState(true);

  // Derive context IDs from props or ancestors (memoized to prevent unnecessary recalculations)
  const contextIds = useMemo(() => {
    return {
      moduleId: moduleId || undefined,
      lessonId: lessonId || undefined,
      groupId: groupId || undefined,
      slideId: slideId || undefined,
    };
  }, [moduleId, lessonId, groupId, slideId]);

  // Load ancestors based on what IDs we have
  useEffect(() => {
    let cancelled = false;

    async function loadAncestors() {
      setLoadingAncestors(true);
      setAncestors({ type: "loading" });

      try {
        if (contextIds.slideId) {
          const result = await getAncestorsForSlide(contextIds.slideId);
          if (cancelled) return;
          if (result.error || !result.data) {
            setAncestors({ type: "error", message: result.error || "Failed to load slide ancestors" });
            setLoadingAncestors(false);
            return;
          }
          setAncestors({ type: "slide", ancestors: result.data });
        } else if (contextIds.groupId) {
          const result = await getAncestorsForGroup(contextIds.groupId);
          if (cancelled) return;
          if (result.error || !result.data) {
            setAncestors({ type: "error", message: result.error || "Failed to load group ancestors" });
            setLoadingAncestors(false);
            return;
          }
          setAncestors({ type: "group", ancestors: result.data });
        } else if (contextIds.lessonId) {
          const result = await getAncestorsForLesson(contextIds.lessonId);
          if (cancelled) return;
          if (result.error || !result.data) {
            setAncestors({ type: "error", message: result.error || "Failed to load lesson ancestors" });
            setLoadingAncestors(false);
            return;
          }
          setAncestors({ type: "lesson", ancestors: result.data });
        } else if (contextIds.moduleId) {
          const result = await loadModuleById(contextIds.moduleId);
          if (cancelled) return;
          if (result.error || !result.data) {
            setAncestors({ type: "error", message: result.error || "Failed to load module" });
            setLoadingAncestors(false);
            return;
          }
          setAncestors({ type: "module", module: result.data });
        } else {
          // No context - we're on home page
          setAncestors({ type: "loading" });
        }
        setLoadingAncestors(false);
      } catch (err: any) {
        if (cancelled) return;
        setAncestors({ type: "error", message: err.message || "Unknown error" });
        setLoadingAncestors(false);
      }
    }

    loadAncestors();

    return () => {
      cancelled = true;
    };
  }, [contextIds.moduleId, contextIds.lessonId, contextIds.groupId, contextIds.slideId]);

  // Derive current context IDs from ancestors (memoized to prevent recalculation)
  const currentContextIds = useMemo(() => {
    if (ancestors.type === "loading" || ancestors.type === "error") {
      return {
        moduleId: contextIds.moduleId,
        lessonId: contextIds.lessonId,
        groupId: contextIds.groupId,
      };
    }

    if (ancestors.type === "module") {
      return {
        moduleId: ancestors.module.id,
        lessonId: undefined,
        groupId: undefined,
      };
    }

    // For lesson, group, or slide ancestors
    const moduleId = ancestors.ancestors.module.id;
    const lessonId = ancestors.ancestors.lesson.id;
    // Only group and slide ancestors have group property
    const groupId =
      ancestors.type === "group" || ancestors.type === "slide"
        ? ancestors.ancestors.group?.id
        : undefined;

    return { moduleId, lessonId, groupId };
  }, [ancestors, contextIds.moduleId, contextIds.lessonId, contextIds.groupId]);

  // Load selector options (memoized per ID to prevent refetches)
  useEffect(() => {
    let cancelled = false;

    async function loadSelectors() {
      setLoadingSelectors(true);

      try {
        // Load modules (only once, or if not loaded yet)
        if (!loadedKeysRef.current.modules) {
          const modulesResult = await loadModules();
          if (cancelled) return;
          if (modulesResult.data) {
            setModules(modulesResult.data);
            loadedKeysRef.current.modules = true;
          }
        }

        // Load lessons if we have a module context (only if moduleId changed)
        if (currentContextIds.moduleId) {
          if (loadedKeysRef.current.lessons !== currentContextIds.moduleId) {
            const lessonsResult = await loadLessonsByModule(currentContextIds.moduleId);
            if (cancelled) return;
            if (lessonsResult.data) {
              setLessons(lessonsResult.data);
              loadedKeysRef.current.lessons = currentContextIds.moduleId;
            }
          }
        } else {
          // Clear lessons if no module context
          if (loadedKeysRef.current.lessons !== null) {
            setLessons([]);
            loadedKeysRef.current.lessons = null;
          }
        }

        // Load groups if we have a lesson context (only if lessonId changed)
        if (currentContextIds.lessonId) {
          if (loadedKeysRef.current.groups !== currentContextIds.lessonId) {
            const groupsResult = await loadGroupsByLesson(currentContextIds.lessonId);
            if (cancelled) return;
            if (groupsResult.data) {
              setGroups(groupsResult.data);
              loadedKeysRef.current.groups = currentContextIds.lessonId;
            }
          }
        } else {
          // Clear groups if no lesson context
          if (loadedKeysRef.current.groups !== null) {
            setGroups([]);
            loadedKeysRef.current.groups = null;
          }
        }

        // Load slides - prefer group if available, otherwise lesson
        const slidesKey = currentContextIds.groupId || currentContextIds.lessonId || null;
        if (slidesKey && loadedKeysRef.current.slides !== slidesKey) {
          let slidesResult;
          if (currentContextIds.groupId) {
            slidesResult = await loadSlidesByGroup(currentContextIds.groupId);
          } else if (currentContextIds.lessonId) {
            slidesResult = await loadSlidesByLesson(currentContextIds.lessonId);
          }

          if (cancelled) return;
          if (slidesResult?.data) {
            setSlides(slidesResult.data);
            loadedKeysRef.current.slides = slidesKey;
          }
        } else if (!slidesKey) {
          // Clear slides if no context
          if (loadedKeysRef.current.slides !== null) {
            setSlides([]);
            loadedKeysRef.current.slides = null;
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading selectors:", err);
        }
      } finally {
        if (!cancelled) {
          setLoadingSelectors(false);
        }
      }
    }

    // Only load if ancestors are loaded (not loading or error)
    if (ancestors.type !== "loading" && ancestors.type !== "error") {
      loadSelectors();
    } else {
      setLoadingSelectors(false);
    }

    return () => {
      cancelled = true;
    };
  }, [currentContextIds.moduleId, currentContextIds.lessonId, currentContextIds.groupId, ancestors.type]);

  // Navigation handlers
  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedModuleId = e.target.value;
    if (selectedModuleId) {
      router.push(`/edit-module/${selectedModuleId}`);
    }
  };

  const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLessonId = e.target.value;
    if (selectedLessonId) {
      router.push(`/lesson-slides/${selectedLessonId}`);
    }
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGroupId = e.target.value;
    if (selectedGroupId) {
      router.push(`/edit-group/${selectedGroupId}`);
    }
  };

  const handleSlideChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlideId = e.target.value;
    if (selectedSlideId) {
      router.push(`/edit-slide/${selectedSlideId}`);
    }
  };

  // Build breadcrumbs
  const breadcrumbs: Breadcrumb[] = useMemo(() => {
    const crumbs: Breadcrumb[] = [];

    // Always show Modules as first breadcrumb
    crumbs.push({ label: "Modules", href: "/" });

    if (ancestors.type === "loading" || ancestors.type === "error") {
      // On home page or error - just show "Modules"
      // (already added above)
    } else if (ancestors.type === "module") {
      crumbs.push({ label: ancestors.module.title, href: `/edit-module/${ancestors.module.id}` });
    } else if (ancestors.type === "lesson") {
      crumbs.push({ label: ancestors.ancestors.module.title, href: `/edit-module/${ancestors.ancestors.module.id}` });
      crumbs.push({ label: ancestors.ancestors.lesson.title, href: `/lesson-slides/${ancestors.ancestors.lesson.id}` });
    } else if (ancestors.type === "group") {
      crumbs.push({ label: ancestors.ancestors.module.title, href: `/edit-module/${ancestors.ancestors.module.id}` });
      crumbs.push({ label: ancestors.ancestors.lesson.title, href: `/lesson-slides/${ancestors.ancestors.lesson.id}` });
      crumbs.push({ label: ancestors.ancestors.group.title, href: `/edit-group/${ancestors.ancestors.group.id}` });
    } else if (ancestors.type === "slide") {
      crumbs.push({ label: ancestors.ancestors.module.title, href: `/edit-module/${ancestors.ancestors.module.id}` });
      crumbs.push({ label: ancestors.ancestors.lesson.title, href: `/lesson-slides/${ancestors.ancestors.lesson.id}` });
      if (ancestors.ancestors.group) {
        crumbs.push({ label: ancestors.ancestors.group.title, href: `/edit-group/${ancestors.ancestors.group.id}` });
      }
      crumbs.push({ label: `Slide: ${ancestors.ancestors.slide.type}`, href: `/edit-slide/${ancestors.ancestors.slide.id}` });
    }

    return crumbs;
  }, [ancestors]);

  // Determine current values for selectors
  const currentModuleId = useMemo(() => {
    return ancestors.type === "module"
      ? ancestors.module.id
      : ancestors.type === "lesson" || ancestors.type === "group" || ancestors.type === "slide"
      ? ancestors.ancestors.module.id
      : undefined;
  }, [ancestors]);

  const currentLessonId = useMemo(() => {
    return ancestors.type === "lesson" || ancestors.type === "group" || ancestors.type === "slide"
      ? ancestors.ancestors.lesson.id
      : undefined;
  }, [ancestors]);

  const currentGroupId = useMemo(() => {
    return ancestors.type === "group" || ancestors.type === "slide"
      ? ancestors.ancestors.group?.id
      : undefined;
  }, [ancestors]);

  const currentSlideId = useMemo(() => {
    return ancestors.type === "slide" ? ancestors.ancestors.slide.id : undefined;
  }, [ancestors]);

  // Calculate prev/next slide indices
  const { prevSlide, nextSlide } = useMemo(() => {
    const currentSlideIndex = currentSlideId
      ? slides.findIndex((s) => s.id === currentSlideId)
      : -1;
    const prev = currentSlideIndex > 0 ? slides[currentSlideIndex - 1] : null;
    const next = currentSlideIndex >= 0 && currentSlideIndex < slides.length - 1 ? slides[currentSlideIndex + 1] : null;
    return { prevSlide: prev, nextSlide: next };
  }, [currentSlideId, slides]);

  // Build context actions
  const contextActions: ContextAction[] = useMemo(() => {
    const actions: ContextAction[] = [];

    // Note: "Modules" link removed - redundant with top navigation

    // If lessonId exists: show Manage Lesson and Edit Lesson
    if (currentLessonId) {
      actions.push({ label: "Manage Lesson", href: `/lesson-slides/${currentLessonId}` });
      actions.push({ label: "Edit Lesson", href: `/edit-lesson/${currentLessonId}` });
    }

    // If groupId exists: show Back to Group (though it's already in breadcrumbs, this is explicit)
    if (currentGroupId) {
      actions.push({ label: "Back to Group", href: `/edit-group/${currentGroupId}` });
    }

    // If slideId exists: show Prev/Next Slide
    if (currentSlideId) {
      if (prevSlide) {
        actions.push({ label: "← Prev Slide", href: `/edit-slide/${prevSlide.id}` });
      }
      if (nextSlide) {
        actions.push({ label: "Next Slide →", href: `/edit-slide/${nextSlide.id}` });
      }
    }

    // If lessonId exists: show Add Group and Add Slide
    if (currentLessonId) {
      actions.push({ label: "+ Add Group", href: `/new-group?lesson_id=${currentLessonId}` });
      const addSlideHref = currentGroupId
        ? `/new-slide?lesson_id=${currentLessonId}&group_id=${currentGroupId}`
        : `/new-slide?lesson_id=${currentLessonId}`;
      actions.push({ label: "+ Add Slide", href: addSlideHref });
    }

    return actions;
  }, [currentLessonId, currentGroupId, currentSlideId, prevSlide, nextSlide]);

  return {
    loadingAncestors,
    loadingSelectors,
    ancestors,
    modules,
    lessons,
    groups,
    slides,
    currentModuleId,
    currentLessonId,
    currentGroupId,
    currentSlideId,
    breadcrumbs,
    contextActions,
    handleModuleChange,
    handleLessonChange,
    handleGroupChange,
    handleSlideChange,
  };
}

