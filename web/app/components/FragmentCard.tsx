"use client";

import type { Fragment, FragmentFact } from "@/app/types";

interface FragmentCardProps {
  fragment: Fragment;
  checked: boolean;
  onToggleCheck: () => void;
  onToggleStatus: () => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sourceLabel(source: Fragment["source_type"]) {
  switch (source) {
    case "voice":
      return "语音";
    case "document":
      return "文档";
    default:
      return "文字";
  }
}

export default function FragmentCard({
  fragment,
  checked,
  onToggleCheck,
  onToggleStatus,
}: FragmentCardProps) {
  const isIgnored = fragment.status === "ignored";
  const facts: FragmentFact[] = fragment.facts || [];

  return (
    <div
      className={`rounded-xl p-4 transition glass-card ${
        isIgnored ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggleCheck}
          disabled={isIgnored}
          className="mt-1 h-4 w-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
              {sourceLabel(fragment.source_type)}
            </span>
            <span>{formatTime(fragment.created_at)}</span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {fragment.raw_content}
          </p>
          {facts.length > 0 && (
            <div className="mt-2 space-y-1">
              {facts.map((f) => (
                <div
                  key={f.id}
                  className="text-xs text-slate-700 dark:text-slate-300 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/60 dark:border-indigo-800/40 rounded-md px-2 py-1"
                >
                  <span className="font-medium text-indigo-700 dark:text-indigo-300">
                    {f.category}
                  </span>
                  <span className="mx-1 text-slate-400">·</span>
                  {f.fact_text}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onToggleStatus}
          className={`text-xs px-2 py-1 rounded-lg border transition ${
            isIgnored
              ? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          {isIgnored ? "恢复" : "丢弃"}
        </button>
      </div>
    </div>
  );
}
