"use client";

import { useState } from "react";
import type { Fragment } from "@/app/types";
import FragmentCard from "./FragmentCard";

interface FragmentFeedProps {
  fragments: Fragment[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleStatus: (fragment: Fragment) => void;
  onGenerate: () => void;
  generating: boolean;
  onCreateFragment?: (rawContent: string) => void;
}

export default function FragmentFeed({
  fragments,
  selectedIds,
  onToggleSelect,
  onToggleStatus,
  onGenerate,
  generating,
  onCreateFragment,
}: FragmentFeedProps) {
  const [rawContent, setRawContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rawContent.trim() || !onCreateFragment) return;
    setSubmitting(true);
    try {
      await onCreateFragment(rawContent.trim());
      setRawContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between glass-panel">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          共 {fragments.length} 条碎片
          {selectedIds.length > 0 && (
            <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">
              已选中 {selectedIds.length} 条
            </span>
          )}
        </div>
        <button
          onClick={onGenerate}
          disabled={selectedIds.length === 0 || generating}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
        >
          {generating ? "生成中…" : "生成复盘"}
        </button>
      </div>

      {onCreateFragment && (
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/40 bg-white/40 dark:bg-slate-900/40">
          <div className="relative">
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="在此直接录入工作碎片…"
              rows={2}
              className="w-full rounded-xl border border-slate-200/60 dark:border-slate-700/40 bg-white/70 dark:bg-slate-800/70 p-3 pr-20 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!rawContent.trim() || submitting}
              className="absolute right-2 bottom-2 px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "添加中…" : "添加"}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
        {fragments.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-10">
            该项目暂无碎片，请在浏览器插件或上方输入框录入
          </div>
        )}
        {fragments.map((f) => (
          <FragmentCard
            key={f.id}
            fragment={f}
            checked={selectedIds.includes(f.id)}
            onToggleCheck={() => onToggleSelect(f.id)}
            onToggleStatus={() => onToggleStatus(f)}
          />
        ))}
      </div>
    </div>
  );
}
