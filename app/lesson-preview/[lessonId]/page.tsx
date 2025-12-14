"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadLessonById } from "../../../lib/loadLesson";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; lesson: any };

export default function LessonPreviewPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId;

  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!lessonId) {
      setState({ status: "error", message: "No lessonId in URL." });
      return;
    }

    async function run() {
      setState({ status: "loading" });
      try {
        const lesson = await loadLessonById(lessonId);
        setState({ status: "ready", lesson });
      } catch (e: any) {
        setState({
          status: "error",
          message: e?.message ?? "Failed to load lesson.",
        });
      }
    }

    run();
  }, [lessonId]);

  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/">← Back to CMS</Link>
      </div>

      <h1 style={{ margin: 0 }}>Lesson Preview</h1>
      <p style={{ opacity: 0.7, fontSize: 13 }}>
        lessonId: <code>{lessonId}</code>
      </p>

      {state.status === "loading" && <p>Loading…</p>}
      {state.status === "error" && (
        <p style={{ color: "red" }}>Error: {state.message}</p>
      )}

      {state.status === "ready" && (
        <pre style={{ fontSize: 12, marginTop: 16 }}>
          {JSON.stringify(state.lesson, null, 2)}
        </pre>
      )}
    </main>
  );
}
