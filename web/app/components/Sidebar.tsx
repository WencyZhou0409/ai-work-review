"use client";

import { useState } from "react";
import type { Project } from "@/app/types";

interface SidebarProps {
  projects: Project[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string, goal: string) => void;
  onDelete?: (id: number) => void;
}

export default function Sidebar({
  projects,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
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
    <aside className="w-64 h-full border-r border-slate-200/60 dark:border-slate-700/40 bg-slate-100/60 dark:bg-slate-900/40 backdrop-blur-md flex flex-col">
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">项目 / 标签</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition"
        >
          新建
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {projects.length === 0 && (
          <div className="text-sm text-slate-400 p-2">暂无项目</div>
        )}
        {projects.map((p) => (
          <div
            key={p.id}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
              selectedId === p.id
                ? "bg-indigo-600 text-white font-medium shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60"
            }`}
          >
            <button
              onClick={() => onSelect(p.id)}
              className="flex-1 text-left min-w-0"
            >
              <div className="truncate">{p.name}</div>
              {p.goal ? (
                <div className={`truncate text-xs mt-0.5 ${selectedId === p.id ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"}`}>
                  {p.goal}
                </div>
              ) : null}
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`确定删除项目「${p.name}」吗？`)) {
                    onDelete(p.id);
                  }
                }}
                className={`ml-2 text-xs opacity-0 group-hover:opacity-100 transition ${selectedId === p.id ? "text-indigo-100 hover:text-white" : "text-slate-400 hover:text-red-500"}`}
                title="删除"
              >
                删除
              </button>
            )}
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-card rounded-xl shadow-2xl w-80 p-5">
            <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">新建项目</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                  名称
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white/70 dark:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                  placeholder="如：Q3 增长复盘"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                  核心目标
                </label>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white/70 dark:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                  placeholder="如：提升 DAU 10%"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition"
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
