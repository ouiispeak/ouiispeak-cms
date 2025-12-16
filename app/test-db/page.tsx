import Link from "next/link";
import { supabase } from "../../lib/supabase";
import PageContainer from "../../components/ui/PageContainer";

export const dynamic = "force-dynamic";

export default async function TestDbPage() {
  const { data, error } = await supabase
    .from("lessons_authoring")
    .select("id, lesson_slug")
    .limit(5);

  return (
    <>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <h1 style={{ margin: 0 }}>Supabase Connection Test</h1>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", textDecoration: "none", color: "#222326", fontSize: 14 }}>
          <span style={{ fontSize: 18 }}>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>
      <PageContainer>

      {error && (
        <>
          <h2 style={{ color: "red" }}>Error</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </>
      )}

      {data && (
        <>
          <h2>Connection Successful</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
      </PageContainer>
    </>
  );
}
