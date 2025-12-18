import { supabase } from "../../lib/supabase";
import PageShell from "../../components/ui/PageShell";
import CmsSection from "../../components/ui/CmsSection";
import { uiTokens } from "../../lib/uiTokens";

export const dynamic = "force-dynamic";

export default async function TestDbPage() {
  const { data, error } = await supabase
    .from("lessons_authoring")
    .select("id, lesson_slug")
    .limit(5);

  return (
    <PageShell title="Supabase Connection Test">
      {error && (
        <CmsSection title="Error" description="Connection failed">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </CmsSection>
      )}

      {data && (
        <CmsSection title="Connection Successful">
          <pre className="codeText" style={{ fontSize: uiTokens.font.code.size }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </CmsSection>
      )}
    </PageShell>
  );
}
