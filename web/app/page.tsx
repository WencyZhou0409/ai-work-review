"use client";

import { useEffect, useState } from "react";
import type { Fragment, Project, ReviewResult } from "@/app/types";
import {
  createFragment,
  createProject,
  deleteProject,
  generateReview,
  listFragments,
  listProjects,
  updateFragment,
} from "@/lib/api";
import FragmentFeed from "./components/FragmentFeed";
import OutputPanel from "./components/OutputPanel";
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "请求失败";
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [selectedFragmentIds, setSelectedFragmentIds] = useState<number[]>([]);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProjectId == null) return;
    loadFragments(selectedProjectId);
    setResult(null);
    setSelectedFragmentIds([]);
  }, [selectedProjectId]);

  async function loadProjects() {
    try {
      const data = await listProjects();
      setProjects(data);
      if (data.length > 0 && selectedProjectId == null) {
        setSelectedProjectId(data[0].id);
      }
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e) || "加载项目失败");
    }
  }

  async function loadFragments(projectId: number) {
    try {
      const data = await listFragments(projectId);
      setFragments(data);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e) || "加载碎片失败");
    }
  }

  async function handleCreateProject(name: string, goal: string) {
    try {
      const project = await createProject({ name, goal });
      setProjects((prev) => [project, ...prev]);
      setSelectedProjectId(project.id);
    } catch (e) {
      setError(getErrorMessage(e) || "创建项目失败");
    }
  }

  async function handleDeleteProject(id: number) {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) {
        const remaining = projects.filter((p) => p.id !== id);
        setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (e) {
      setError(getErrorMessage(e) || "删除项目失败");
    }
  }

  function handleToggleSelect(id: number) {
    setSelectedFragmentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleToggleStatus(fragment: Fragment) {
    const nextStatus = fragment.status === "active" ? "ignored" : "active";
    try {
      await updateFragment(fragment.id, { status: nextStatus });
      setFragments((prev) =>
        prev.map((f) =>
          f.id === fragment.id ? { ...f, status: nextStatus } : f
        )
      );
      if (nextStatus === "ignored") {
        setSelectedFragmentIds((prev) => prev.filter((x) => x !== fragment.id));
      }
    } catch (e) {
      setError(getErrorMessage(e) || "更新状态失败");
    }
  }

  async function handleCreateFragment(rawContent: string) {
    if (selectedProjectId == null) return;
    try {
      const fragment = await createFragment({
        project_id: selectedProjectId,
        raw_content: rawContent,
        source_type: "text",
        status: "active",
      });
      setFragments((prev) => [fragment, ...prev]);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e) || "添加碎片失败");
    }
  }

  async function handleGenerate() {
    if (selectedProjectId == null || selectedFragmentIds.length === 0) return;
    setGenerating(true);
    try {
      const data = await generateReview(selectedProjectId, selectedFragmentIds);
      setResult(data);
    } catch (e) {
      setError(getErrorMessage(e) || "生成复盘失败");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="h-14 flex items-center justify-between px-4 shrink-0 glass z-20">
        <h1 className="font-semibold text-lg tracking-tight">
          AI 工作复盘助手
        </h1>
        <ThemeToggle />
      </header>

      {error && (
        <div className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 text-sm border-b border-red-500/20 backdrop-blur-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline opacity-80 hover:opacity-100"
          >
            关闭
          </button>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden">
        <Sidebar
          projects={projects}
          selectedId={selectedProjectId}
          onSelect={setSelectedProjectId}
          onCreate={handleCreateProject}
          onDelete={handleDeleteProject}
        />
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          <div className="flex-1 min-w-0">
            <FragmentFeed
              fragments={fragments}
              selectedIds={selectedFragmentIds}
              onToggleSelect={handleToggleSelect}
              onToggleStatus={handleToggleStatus}
              onGenerate={handleGenerate}
              generating={generating}
              onCreateFragment={handleCreateFragment}
            />
          </div>
          <div className="lg:w-[420px] xl:w-[480px] shrink-0 h-64 lg:h-auto">
            <OutputPanel result={result} generating={generating} />
          </div>
        </div>
      </main>
    </div>
  );
}
