"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadLessonById, type LoadedLesson } from "../../../lib/loadLesson";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: LoadedLesson };

export default function LessonPreviewPage() {
  const params = useParams<{ lessonId: string[] }>();
const lessonId = params?.lessonId?.join("/");

  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!lessonId) {
      setState({ status: "error", message: "No lessonId provided in URL." });
      return;
    }

    async function run() {
      setState({ status: "loading" });
      try {
        const data = await loadLessonById(lessonId);
        setState({ status: "ready", data });
      } catch (e: any) {
        setState({
          status: "error",
          message: e?.message ?? "Failed to load lesson.",
        });
      }
    }

    run();
  }, [lessonId]);

  if (state.status === "loading") {
    return (
      <main style={{ padding: 24 }}>
        <h1>Lesson preview</h1>
        <p>Loading…</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main style={{ padding: 24 }}>
        <h1>Lesson preview</h1>
        <p style={{ color: "red" }}>{state.message}</p>
      </main>
    );
  }

  const { lesson, groups } = state.data;

  return (
    <main style={{ padding: 24 }}>
      <h1>Lesson preview</h1>
      <h2>
        {lesson.title} <small style={{ opacity: 0.6 }}>({lesson.slug})</small>
      </h2>

      {groups.length === 0 && <p>No groups yet.</p>}

      {groups.map((g) => (
        <section
          key={g.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            marginTop: 16,
          }}
        >
          <h3>
            Group {g.order_index}: {g.title}
          </h3>

          {g.slides.length === 0 && <p>No supported slides yet.</p>}

          {g.slides.map((slide, idx) => (
            <div
              key={slide.id}
              style={{ borderTop: "1px solid #eee", marginTop: 12, paddingTop: 12 }}
            >
              <h4>
                Slide {idx + 1}: {slide.props.title}
              </h4>
              {slide.props.subtitle && <p><em>{slide.props.subtitle}</em></p>}
              {slide.props.note && (
                <p style={{ fontSize: 12, opacity: 0.8 }}>Note: {slide.props.note}</p>
              )}

              <ul>
                {slide.props.lines.flat().map((cell, i) => (
                  <li key={i}>{cell.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
