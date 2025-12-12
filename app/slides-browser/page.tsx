"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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
      <main style={{ padding: 24 }}>
        <h1>Slides Browser</h1>
        <p>Loading lessons, groups, and slides…</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main style={{ padding: 24 }}>
        <h1>Slides Browser</h1>
        <h2 style={{ color: "red" }}>Supabase error</h2>
        <pre style={{ fontSize: 12 }}>
          {JSON.stringify(
            {
              message: state.message,
              details: state.details,
            },
            null,
            2
          )}
        </pre>
      </main>
    );
  }

  const { lessons, groups, slides } = state;

  return (
    <main style={{ padding: 24 }}>
      <h1>Slides Browser</h1>

      {lessons.length === 0 && <p>No lessons found.</p>}

      {lessons.map((lesson) => {
        const lessonGroups = groups.filter(
          (g) => g.lesson_id === lesson.id
        );

        return (
          <section
            key={lesson.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginTop: 16,
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Lesson: {lesson.title} ({lesson.lesson_slug})
            </h2>

            {lessonGroups.length === 0 && <p>No groups yet.</p>}

            {lessonGroups.map((group) => {
              const groupSlides = slides.filter(
                (s) => s.group_id === group.id
              );

              return (
                <div
                  key={group.id}
                  style={{
                    borderTop: "1px solid #eee",
                    paddingTop: 8,
                    marginTop: 8,
                  }}
                >
                  <h3>
                    Group {group.order_index}: {group.title}
                  </h3>

                  {groupSlides.length === 0 && <p>No slides yet.</p>}

                  {groupSlides.length > 0 && (
                    <ul>
                      {groupSlides.map((slide) => (
                        <li key={slide.id}>
                          <a href={`/edit-slide/${slide.id}`}>
                            Slide {slide.order_index}: {slide.type} (id:{" "}
                            {slide.id})
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}

      <h2 style={{ marginTop: 32 }}>Raw data (debug)</h2>
      <pre style={{ fontSize: 12 }}>
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
    </main>
  );
}
