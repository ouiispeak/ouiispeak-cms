"use client";

import React from "react";
import Link from "next/link";
import { a0StandardsConfig } from "../../../../lib/cefr/levels/a0";
import { useStandardsChecklist } from "../../../../lib/cefr/useStandardsChecklist";
import StandardsContextBar from "../../../../components/cefr/StandardsContextBar";

export default function A0StandardsPage() {
  const config = a0StandardsConfig;
  const {
    ready,
    checked,
    toggle,
    setMany,
    resetAll,
    overallProgress,
    pillarProgress,
  } = useStandardsChecklist(config);

  const [openId, setOpenId] = React.useState<string | null>(
    config.pillars[0]?.id ?? null
  );

  const handleReset = () => {
    if (window.confirm("Reset all checklist items for A0?")) {
      resetAll();
    }
  };

  return (
    <>
      <StandardsContextBar level={config.level} />
      <main className="min-h-screen bg-stone-50 text-stone-900 p-6 sm:p-10 space-y-6">
      <header className="flex flex-col gap-4 rounded-xl bg-white shadow-sm border border-stone-200 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-stone-500">CEFR Level {config.level}</p>
            <h1 className="text-2xl font-semibold text-stone-900">{config.title}</h1>
          </div>
          <span className="text-sm text-stone-500">Version {config.version}</span>
        </div>
        <p className="text-stone-700 leading-relaxed">{config.identity}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-700">
          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            Overall: {overallProgress.completed} / {overallProgress.total}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-stone-700 border border-stone-200 rounded-md px-3 py-1 hover:bg-stone-100 transition"
          >
            Reset all
          </button>
          <Link href="/cefr" className="text-sm text-sky-700 hover:underline">
            Back to CEFR
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Success looks like</h2>
          <ul className="list-disc list-inside space-y-1 text-stone-700">
            {config.successLooksLike.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Boundaries</h2>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-semibold text-stone-800">In scope</p>
              <ul className="list-disc list-inside text-stone-700 space-y-1">
                {config.boundaries.inScope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-stone-800">Out of scope</p>
              <ul className="list-disc list-inside text-stone-700 space-y-1">
                {config.boundaries.outOfScope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-stone-800">Acceptable errors</p>
              <ul className="list-disc list-inside text-stone-700 space-y-1">
                {config.boundaries.acceptableErrors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Quick navigation</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {config.pillars.map((pillar) => (
            <a
              key={pillar.id}
              href={`#pillar-${pillar.id}`}
              className="px-3 py-1 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-100 transition"
            >
              {pillar.title}
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {config.pillars.map((pillar, idx) => {
          const isOpen = openId === pillar.id;
          const progress = pillarProgress[pillar.id] || { completed: 0, total: pillar.items.length };
          return (
            <div
              key={pillar.id}
              id={`pillar-${pillar.id}`}
              className="bg-white border border-stone-200 rounded-xl shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : pillar.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <p className="text-sm uppercase tracking-wide text-stone-500">Pillar {idx + 1}</p>
                  <h3 className="text-xl font-semibold text-stone-900">{pillar.title}</h3>
                  <p className="text-sm text-stone-700 mt-1">{pillar.description}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-700">
                  <span className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    {progress.completed} / {progress.total}
                  </span>
                  <span className="text-stone-500">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-stone-200 px-5 py-4 space-y-3">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                      onClick={() => setMany(pillar.items.map((i) => i.id), true)}
                    >
                      Mark all in this section
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-md border border-stone-200 text-stone-700 hover:bg-stone-100 transition"
                      onClick={() => setMany(pillar.items.map((i) => i.id), false)}
                    >
                      Clear section
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {pillar.items.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-stone-200 p-4 flex flex-col gap-2 hover:bg-stone-50"
                      >
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 text-sky-600 border-stone-300 rounded focus:ring-sky-500"
                            checked={!!checked[item.id]}
                            onChange={() => toggle(item.id)}
                            disabled={!ready}
                          />
                          <div className="space-y-1">
                            <p className="font-semibold text-stone-900">{item.label}</p>
                            <p className="text-sm text-stone-700 leading-relaxed">{item.detail}</p>
                            {item.examples && item.examples.length > 0 && (
                              <ul className="text-sm text-stone-600 list-disc list-inside space-y-1">
                                {item.examples.map((ex) => (
                                  <li key={ex}>{ex}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </section>
      </main>
    </>
  );
}
