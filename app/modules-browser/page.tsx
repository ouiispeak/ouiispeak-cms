"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";

type ModuleRow = {
  id: string;
  slug: string;
  title: string;
  order_index: number;
};

type LessonRow = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  order_index: number;
};

export default function ModulesBrowserPage() {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("id, slug, title, order_index")
        .order("order_index", { ascending: true });

      if (modulesError) {
        setError(modulesError.message);
        return;
      }

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, module_id, slug, title, order_index")
        .order("order_index", { ascending: true });

      if (lessonsError) {
        setError(lessonsError.message);
        return;
      }

      setModules(modulesData ?? []);
      setLessons(lessonsData ?? []);
    }

    load();
  }, []);

  if (error) {
    return (
      <>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <h1 style={{ margin: 0 }}>Modules Browser</h1>
        </div>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <BackButton title="Back to Dashboard" />
        </div>
        <PageContainer>
          <p style={{ color: "red" }}>{error}</p>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>Modules Browser</h1>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <BackButton title="Back to Dashboard" />
      </div>
      <PageContainer>

      {modules.map((module) => {
        const moduleLessons = lessons.filter(
          (lesson) => lesson.module_id === module.id
        );

        return (
          <section
            key={module.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginTop: 16,
            }}
          >
            <h2>
              {module.title}{" "}
              <small style={{ opacity: 0.6 }}>({module.slug})</small>
            </h2>

            {moduleLessons.length === 0 && (
              <p>No lessons in this module yet.</p>
            )}

            <ul>
              {moduleLessons.map((lesson) => (
                <li key={lesson.id}>
                  {lesson.order_index}. {lesson.title}{" "}
                  <small style={{ opacity: 0.6 }}>
                    ({lesson.slug})
                  </small>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      </PageContainer>
    </>
  );
}
