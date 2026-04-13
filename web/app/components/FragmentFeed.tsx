"use client";

import type { Fragment } from "@/app/types";
import FragmentCard from "./FragmentCard";

interface FragmentFeedProps {
  fragments: Fragment[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleStatus: (fragment: Fragment) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function FragmentFeed({
  fragments,
  selectedIds,
  onToggleSelect,
  onToggleStatus,
  onGenerate,
  generating,
}: FragmentFeedProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="text-sm text-gray-500">
          共 {fragments.length} 条碎片
          {selectedIds.length > 0 && (
            <span className="ml-2 text-indigo-600">
              已选中 {selectedIds.length} 条
            </span>
          )}
        </div>
        <button
          onClick={onGenerate}
          disabled={selectedIds.length === 0 || generating}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? "生成中…" : "生成复盘"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {fragments.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-10">
            该项目暂无碎片，请在浏览器插件或此处录入
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
