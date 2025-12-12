import { supabase } from "../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";

export const dynamic = "force-dynamic";

export default async function DbSlideTestPage() {
  // 1. Load the slide row from Supabase
  const { data, error } = await supabase
    .from("slides_authoring")
    .select("id, group_id, type, props_json, aid_hook")
    .eq("id", "slide-ai-001")
    .maybeSingle();

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>DB Slide Test</h1>
        <h2 style={{ color: "red" }}>Supabase error</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: 24 }}>
        <h1>DB Slide Test</h1>
        <h2>No slide found with id "slide-ai-001"</h2>
      </main>
    );
  }

  // 2. Convert DB row into the shape our Zod schema expects
  const rawSlide = {
    id: data.id,
    groupId: data.group_id ?? undefined,
    type: data.type,
    props: data.props_json,
    aidHook: data.aid_hook ?? null,
  };

  const result = aiSpeakRepeatSlideSchema.safeParse(rawSlide);

  if (!result.success) {
    return (
      <main style={{ padding: 24 }}>
        <h1>DB Slide Test</h1>
        <h2 style={{ color: "red" }}>Validation failed</h2>
        <pre>{JSON.stringify(result.error.format(), null, 2)}</pre>
        <h3>Raw slide</h3>
        <pre>{JSON.stringify(rawSlide, null, 2)}</pre>
      </main>
    );
  }

  const slide: RealAiSpeakRepeatSlide = result.data;

  return (
    <main style={{ padding: 24 }}>
      <h1>DB Slide Test</h1>
      <p>
        Loaded slide from Supabase with id: <strong>{slide.id}</strong>
      </p>

      <h2>{slide.props.title}</h2>
      {slide.props.subtitle && <p>{slide.props.subtitle}</p>}
      {slide.props.note && (
        <p>
          <em>{slide.props.note}</em>
        </p>
      )}

      <h3>Lines</h3>
      {slide.props.lines.map((row, rowIndex) => (
        <ul key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <li key={cellIndex}>
              <strong>{cell.label}</strong> –{" "}
              {cell.speech.text ?? "[no text, maybe file mode]"}
            </li>
          ))}
        </ul>
      ))}

      <h3>Raw data from DB</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
