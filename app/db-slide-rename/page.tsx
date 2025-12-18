import { supabase } from "../../lib/supabase";
import {
  aiSpeakRepeatSlideSchema,
  type RealAiSpeakRepeatSlide,
} from "../../lib/realSlideSchema";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import { uiTokens } from "../../lib/uiTokens";

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
      <PageShell title="DB Slide Rename Test">
        <CmsSection>
          <p>
            No <code className="codeText">title</code> query parameter provided.
          </p>
          <p>Use something like:</p>
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            http://localhost:3000/db-slide-rename?title=My%20new%20title
          </pre>
        </CmsSection>
      </PageShell>
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
      <PageShell title="DB Slide Rename Test">
        <CmsSection title="Supabase error (load)" description="Failed to load slide">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </CmsSection>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell title="DB Slide Rename Test">
        <CmsSection title="Not Found">
          <p>No slide found with id "slide-ai-001"</p>
        </CmsSection>
      </PageShell>
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
      <PageShell title="DB Slide Rename Test">
        <CmsSection title="Validation failed" description="After title change">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(parsed.error.format(), null, 2)}
          </pre>
          <h3 style={{ marginTop: uiTokens.space.md, fontSize: uiTokens.font.label.size }}>Raw slide</h3>
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(rawSlide, null, 2)}
          </pre>
        </CmsSection>
      </PageShell>
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
      <PageShell title="DB Slide Rename Test">
        <CmsSection title="Supabase error (update)" description="Failed to update slide">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(updateError, null, 2)}
          </pre>
        </CmsSection>
      </PageShell>
    );
  }

  return (
    <PageShell title="DB Slide Rename Test">
      <CmsSection>
        <p>
          Updated slide <strong>{slide.id}</strong> title to:
        </p>
        <h2 style={{ fontSize: uiTokens.font.sectionTitle.size, marginTop: uiTokens.space.sm }}>
          {slide.props.title}
        </h2>
      </CmsSection>

      <CmsSection title="New props">
        <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
          {JSON.stringify(slide.props, null, 2)}
        </pre>
      </CmsSection>
    </PageShell>
  );
}
