import { useEffect, useMemo, useState } from "react";
import type { CefrStandardsConfig } from "./types";

type ChecklistState = Record<string, boolean>;

export function useStandardsChecklist(config: CefrStandardsConfig) {
  const storageKey = `cefr:standards:${config.level}:v${config.version}`;
  const allIds = useMemo(
    () => config.pillars.flatMap((pillar) => pillar.items.map((item) => item.id)),
    [config]
  );

  const [checked, setChecked] = useState<ChecklistState>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as ChecklistState;
        setChecked(parsed);
      }
    } catch {
      // ignore parse errors and start fresh
    } finally {
      setReady(true);
    }
  }, [storageKey]);

  const persist = (next: ChecklistState) => {
    setChecked(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore storage errors in fallback environments
    }
  };

  const toggle = (id: string) => {
    persist({ ...checked, [id]: !checked[id] });
  };

  const setMany = (ids: string[], value: boolean) => {
    const next = { ...checked };
    ids.forEach((id) => {
      next[id] = value;
    });
    persist(next);
  };

  const resetAll = () => {
    persist({});
  };

  const overallProgress = useMemo(() => {
    const total = allIds.length;
    const completed = allIds.filter((id) => checked[id]).length;
    return { completed, total };
  }, [allIds, checked]);

  const pillarProgress = useMemo(() => {
    return config.pillars.reduce<Record<string, { completed: number; total: number }>>((acc, pillar) => {
      const ids = pillar.items.map((item) => item.id);
      const total = ids.length;
      const completed = ids.filter((id) => checked[id]).length;
      acc[pillar.id] = { completed, total };
      return acc;
    }, {});
  }, [checked, config.pillars]);

  return {
    ready,
    checked,
    toggle,
    setMany,
    resetAll,
    overallProgress,
    pillarProgress,
  };
}
