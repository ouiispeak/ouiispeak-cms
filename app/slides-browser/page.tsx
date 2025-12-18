"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import LinkButton from "../../components/ui/LinkButton";
import { uiTokens } from "../../lib/uiTokens";

type LessonRow = {
  id: string;
  lesson_slug: string;
  title: string;
};

type GroupRow = {
  id: string;
  lesson_id: string;
  order_index: number;
  title: string;
};

type SlideRow = {
  id: string;
  lesson_id: string;
  group_id: string;
  order_index: number;
  type: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string; details?: unknown }
  | {
      status: "ready";
      lessons: LessonRow[];
      groups: GroupRow[];
      slides: SlideRow[];
    };

export default function SlidesBrowserPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    async function load() {
      try {
        const [
          { data: lessonsData, error: lessonsError },
          { data: groupsData, error: groupsError },
          { data: slidesData, error: slidesError },
        ] = await Promise.all([
          supabase
            .from("lessons_authoring")
            .select("id, lesson_slug, title")
            .order("lesson_slug", { ascending: true }),
          supabase
            .from("lesson_groups_authoring")
            .select("id, lesson_id, order_index, title")
            .order("lesson_id", { ascending: true })
            .order("order_index", { ascending: true }),
          supabase
            .from("slides_authoring")
            .select("id, lesson_id, group_id, order_index, type")
            .order("lesson_id", { ascending: true })
            .order("group_id", { ascending: true })
            .order("order_index", { ascending: true }),
        ]);

        if (lessonsError || groupsError || slidesError) {
          setState({
            status: "error",
            message: "Supabase error while loading data.",
            details: {
              lessonsError,
              groupsError,
              slidesError,
            },
          });
          return;
        }

        setState({
          status: "ready",
          lessons: (lessonsData ?? []) as LessonRow[],
          groups: (groupsData ?? []) as GroupRow[],
          slides: (slidesData ?? []) as SlideRow[],
        });
      } catch (err) {
        setState({
          status: "error",
          message: "Unexpected error while loading data.",
          details: err,
        });
      }
    }

    load();
  }, []);

  if (state.status === "loading") {
    return (
      <PageShell title="Slides Browser">
        <p>Loading lessons, groups, and slides…</p>
      </PageShell>
    );
  }

  if (state.status === "error") {
    return (
      <PageShell title="Slides Browser">
        <CmsSection title="Supabase error" description={state.message}>
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(
              {
                message: state.message,
                details: state.details,
              },
              null,
              2
            )}
          </pre>
        </CmsSection>
      </PageShell>
    );
  }

  const { lessons, groups, slides } = state;

  return (
    <PageShell title="Slides Browser">
      {lessons.length === 0 && <p>No lessons found.</p>}

      {lessons.map((lesson) => {
        const lessonGroups = groups.filter(
          (g) => g.lesson_id === lesson.id
        );

        return (
          <CmsSection
            key={lesson.id}
            title={
              <>
                Lesson: {lesson.title} <span className="metaText">({lesson.lesson_slug})</span>
              </>
            }
          >
            {lessonGroups.length === 0 && <p>No groups yet.</p>}

            {lessonGroups.map((group) => {
              const groupSlides = slides.filter(
                (s) => s.group_id === group.id
              );

              return (
                <div
                  key={group.id}
                  style={{
                    borderTop: `1px solid ${uiTokens.color.borderSubtle}`,
                    paddingTop: uiTokens.space.xs,
                    marginTop: uiTokens.space.xs,
                  }}
                >
                  <h3 style={{ fontSize: uiTokens.font.label.size, fontWeight: uiTokens.font.label.weight, marginTop: 0, marginBottom: uiTokens.space.xs }}>
                    Group {group.order_index}: {group.title}
                  </h3>

                  {groupSlides.length === 0 && <p className="metaText">No slides yet.</p>}

                  {groupSlides.length > 0 && (
                    <ul style={{ paddingLeft: uiTokens.space.md, margin: 0 }}>
                      {groupSlides.map((slide) => (
                        <li key={slide.id} style={{ marginBottom: uiTokens.space.xs }}>
                          <LinkButton href={`/edit-slide/${slide.id}`} variant="ghost" size="sm">
                            Slide {slide.order_index}: {slide.type} (id: <code className="codeText">{slide.id}</code>)
                          </LinkButton>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </CmsSection>
        );
      })}

      <CmsSection title="Raw data (debug)">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(
            {
              lessons,
              groups,
              slides,
            },
            null,
            2
          )}
        </pre>
      </CmsSection>
    </PageShell>
  );
}
