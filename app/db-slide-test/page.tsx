import { supabase } from "../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import { uiTokens } from "../../lib/uiTokens";

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
      <PageShell title="DB Slide Test">
        <CmsSection title="Supabase error" description="Failed to load slide">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </CmsSection>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell title="DB Slide Test">
        <CmsSection title="Not Found">
          <p>No slide found with id "slide-ai-001"</p>
        </CmsSection>
      </PageShell>
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
      <PageShell title="DB Slide Test">
        <CmsSection title="Validation failed" description="Slide data does not match schema">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(result.error.format(), null, 2)}
          </pre>
          <h3 style={{ marginTop: uiTokens.space.md, fontSize: uiTokens.font.label.size }}>Raw slide</h3>
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(rawSlide, null, 2)}
          </pre>
        </CmsSection>
      </PageShell>
    );
  }

  const slide: RealAiSpeakRepeatSlide = result.data;

  return (
    <PageShell
      title="DB Slide Test"
      meta={
        <>
          Loaded slide from Supabase with id: <code className="codeText">{slide.id}</code>
        </>
      }
    >
      <CmsSection title={slide.props.title}>
        {slide.props.subtitle && <p>{slide.props.subtitle}</p>}
        {slide.props.note && (
          <p>
            <em>{slide.props.note}</em>
          </p>
        )}

        <h3 style={{ fontSize: uiTokens.font.label.size, fontWeight: uiTokens.font.label.weight, marginTop: uiTokens.space.md }}>Lines</h3>
        {slide.props.lines.map((row, rowIndex) => (
          <ul key={rowIndex} style={{ paddingLeft: uiTokens.space.md }}>
            {row.map((cell, cellIndex) => (
              <li key={cellIndex} style={{ marginBottom: uiTokens.space.xs }}>
                <strong>{cell.label}</strong> –{" "}
                {cell.speech.text ?? "[no text, maybe file mode]"}
              </li>
            ))}
          </ul>
        ))}
      </CmsSection>

      <CmsSection title="Raw data from DB">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </CmsSection>
    </PageShell>
  );
}
