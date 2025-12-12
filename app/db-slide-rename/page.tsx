import { supabase } from "../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    title?: string;
  }>;
};

export default async function DbSlideRenamePage({ searchParams }: PageProps) {
  const { title } = await searchParams;

  if (!title) {
    return (
      <main style={{ padding: 24 }}>
        <h1>DB Slide Rename Test</h1>
        <p>
          No <code>title</code> query parameter provided.
        </p>
        <p>Use something like:</p>
        <pre>
          http://localhost:3000/db-slide-rename?title=My%20new%20title
        </pre>
      </main>
    );
  }

  // 1. Load the slide row from Supabase
  const { data, error } = await supabase
    .from("slides_authoring")
    .select("id, group_id, type, props_json, aid_hook")
    .eq("id", "slide-ai-001")
    .maybeSingle();

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>DB Slide Rename Test</h1>
        <h2 style={{ color: "red" }}>Supabase error (load)</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: 24 }}>
        <h1>DB Slide Rename Test</h1>
        <h2>No slide found with id "slide-ai-001"</h2>
      </main>
    );
  }

  // 2. Build new props with updated title
  const newProps = {
    ...(data.props_json as any),
    title,
  };

  const rawSlide = {
    id: data.id,
    groupId: data.group_id ?? undefined,
    type: data.type,
    props: newProps,
    aidHook: data.aid_hook ?? null,
  };

  const parsed = aiSpeakRepeatSlideSchema.safeParse(rawSlide);

  if (!parsed.success) {
    return (
      <main style={{ padding: 24 }}>
        <h1>DB Slide Rename Test</h1>
        <h2 style={{ color: "red" }}>Validation failed after title change</h2>
        <pre>{JSON.stringify(parsed.error.format(), null, 2)}</pre>
        <h3>Raw slide</h3>
        <pre>{JSON.stringify(rawSlide, null, 2)}</pre>
      </main>
    );
  }

  const slide: RealAiSpeakRepeatSlide = parsed.data;

  // 3. Write updated props_json back to Supabase
  const { error: updateError } = await supabase
    .from("slides_authoring")
    .update({ props_json: slide.props })
    .eq("id", "slide-ai-001");

  if (updateError) {
    return (
      <main style={{ padding: 24 }}>
        <h1>DB Slide Rename Test</h1>
        <h2 style={{ color: "red" }}>Supabase error (update)</h2>
        <pre>{JSON.stringify(updateError, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>DB Slide Rename Test</h1>
      <p>
        Updated slide <strong>{slide.id}</strong> title to:
      </p>
      <h2>{slide.props.title}</h2>

      <h3>New props</h3>
      <pre>{JSON.stringify(slide.props, null, 2)}</pre>
    </main>
  );
}
