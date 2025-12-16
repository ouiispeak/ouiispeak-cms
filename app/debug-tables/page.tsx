"use client";

import { BackButton } from "../../components/BackButton";
import PageContainer from "../../components/ui/PageContainer";

export default function DebugTablesPage() {
    return (
      <>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <h1 style={{ margin: 0 }}>Debug Tables</h1>
        </div>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <BackButton title="Back to Dashboard" />
        </div>
        <PageContainer>
          <p>OK</p>
        </PageContainer>
      </>
    );
  }
