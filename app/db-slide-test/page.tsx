import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import PageContainer from "../../components/ui/PageContainer";

export const dynamic = "force-dynamic";

const BackLink = () => (
  <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", textDecoration: "none", color: "#222326", fontSize: 14 }}>
    <span style={{ fontSize: 18 }}>←</span>
    <span>Back to Dashboard</span>
  </Link>
);

export default async function DbSlideTestPage() {
  // 1. Load the slide row from Supabase
  const { data, error } = await supabase
    .from("slides_authoring")
    .select("id, group_id, type, props_json, aid_hook")
    .eq("id", "slide-ai-001")
    .maybeSingle();

  if (error) {
    return (
      <>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <h1 style={{ margin: 0 }}>DB Slide Test</h1>
        </div>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <BackLink />
        </div>
        <PageContainer>
          <h2 style={{ color: "red" }}>Supabase error</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </PageContainer>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <h1 style={{ margin: 0 }}>DB Slide Test</h1>
        </div>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <BackLink />
        </div>
        <PageContainer>
          <h2>No slide found with id "slide-ai-001"</h2>
        </PageContainer>
      </>
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
      <>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <h1 style={{ margin: 0 }}>DB Slide Test</h1>
        </div>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <BackLink />
        </div>
        <PageContainer>
          <h2 style={{ color: "red" }}>Validation failed</h2>
          <pre>{JSON.stringify(result.error.format(), null, 2)}</pre>
          <h3>Raw slide</h3>
          <pre>{JSON.stringify(rawSlide, null, 2)}</pre>
        </PageContainer>
      </>
    );
  }

  const slide: RealAiSpeakRepeatSlide = result.data;

  return (
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>DB Slide Test</h1>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <BackLink />
      </div>
      <PageContainer>
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
      </PageContainer>
    </>
  );
}
