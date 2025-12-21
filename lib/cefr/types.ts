export type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
  examples?: string[];
};

export type Pillar = {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
};

export type CefrStandardsConfig = {
  level: string;
  title: string;
  version: string;
  identity: string;
  successLooksLike: string[];
  boundaries: {
    inScope: string[];
    outOfScope: string[];
    acceptableErrors: string[];
  };
  pillars: Pillar[];
};
