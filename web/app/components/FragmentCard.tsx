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
      className={`border rounded-lg p-4 bg-white transition ${
        isIgnored ? "opacity-60 bg-gray-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggleCheck}
          disabled={isIgnored}
          className="mt-1 h-4 w-4 text-indigo-600 rounded"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span className="px-1.5 py-0.5 bg-gray-100 rounded">
              {sourceLabel(fragment.source_type)}
            </span>
            <span>{formatTime(fragment.created_at)}</span>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {fragment.raw_content}
          </p>
          {facts.length > 0 && (
            <div className="mt-2 space-y-1">
              {facts.map((f) => (
                <div
                  key={f.id}
                  className="text-xs text-gray-600 bg-indigo-50 border border-indigo-100 rounded px-2 py-1"
                >
                  <span className="font-medium text-indigo-700">
                    {f.category}
                  </span>
                  <span className="mx-1">·</span>
                  {f.fact_text}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onToggleStatus}
          className={`text-xs px-2 py-1 rounded border ${
            isIgnored
              ? "text-green-600 border-green-200 hover:bg-green-50"
              : "text-gray-500 border-gray-200 hover:bg-gray-100"
          }`}
        >
          {isIgnored ? "恢复" : "丢弃"}
        </button>
      </div>
    </div>
  );
}
