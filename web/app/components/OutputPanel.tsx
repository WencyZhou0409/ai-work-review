"use client";

import { useState } from "react";
import type { ReviewResult } from "@/app/types";

interface OutputPanelProps {
  result: ReviewResult | null;
  generating?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      {copied ? "已复制" : "复制"}
    </button>
  );
}

export default function OutputPanel({ result, generating }: OutputPanelProps) {
  if (generating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-sm p-6 border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-slate-700/40 glass-panel">
        <div className="w-8 h-8 border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-3" />
        <p>AI 正在生成复盘，请稍候…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm p-6 border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-slate-700/40 glass-panel">
        <p>在左侧勾选碎片后，点击「生成复盘」</p>
        <p className="mt-1">即可在此处查看汇报模式与简历模式</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-slate-700/40 p-4 space-y-4 glass-panel">
      <div className="rounded-xl p-4 glass-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">视角 A：汇报模式</h3>
          <CopyButton text={result.report_mode} />
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {result.report_mode}
        </div>
      </div>

      <div className="rounded-xl p-4 glass-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">视角 B：简历模式</h3>
          <CopyButton text={result.resume_mode} />
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {result.resume_mode}
        </div>
      </div>
    </div>
  );
}
