"use client";

import { useState } from "react";
import type { Project } from "@/app/types";

interface SidebarProps {
  projects: Project[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string, goal: string) => void;
}

export default function Sidebar({
  projects,
  selectedId,
  onSelect,
  onCreate,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), goal.trim());
    setName("");
    setGoal("");
    setIsOpen(false);
  };

  return (
    <aside className="w-64 h-full border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">项目 / 标签</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          新建
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {projects.length === 0 && (
          <div className="text-sm text-gray-400 p-2">暂无项目</div>
        )}
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`w-full text-left px-3 py-2 rounded text-sm transition ${
              selectedId === p.id
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="truncate">{p.name}</div>
            {p.goal ? (
              <div className="truncate text-xs text-gray-400 mt-0.5">
                {p.goal}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-xl w-80 p-5">
            <h3 className="font-semibold mb-3">新建项目</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  名称
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="如：Q3 增长复盘"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  核心目标
                </label>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="如：提升 DAU 10%"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
