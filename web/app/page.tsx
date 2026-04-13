"use client";

import { useEffect, useState } from "react";
import type { Fragment, Project, ReviewResult } from "@/app/types";
import {
  createProject,
  generateReview,
  listFragments,
  listProjects,
  updateFragment,
} from "@/lib/api";
import FragmentFeed from "./components/FragmentFeed";
import OutputPanel from "./components/OutputPanel";
import Sidebar from "./components/Sidebar";

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
    } catch (e: any) {
      setError(e.message || "加载项目失败");
    }
  }

  async function loadFragments(projectId: number) {
    try {
      const data = await listFragments(projectId);
      setFragments(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || "加载碎片失败");
    }
  }

  async function handleCreateProject(name: string, goal: string) {
    try {
      const project = await createProject({ name, goal });
      setProjects((prev) => [project, ...prev]);
      setSelectedProjectId(project.id);
    } catch (e: any) {
      setError(e.message || "创建项目失败");
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
    } catch (e: any) {
      setError(e.message || "更新状态失败");
    }
  }

  async function handleGenerate() {
    if (selectedProjectId == null || selectedFragmentIds.length === 0) return;
    setGenerating(true);
    try {
      const data = await generateReview(selectedProjectId, selectedFragmentIds);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "生成复盘失败");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="h-14 border-b flex items-center px-4 bg-white shrink-0">
        <h1 className="font-semibold text-lg text-gray-800">
          AI 工作复盘助手
        </h1>
      </header>

      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm border-b">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline"
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
            />
          </div>
          <div className="lg:w-[420px] xl:w-[480px] shrink-0 h-64 lg:h-auto">
            <OutputPanel result={result} />
          </div>
        </div>
      </main>
    </div>
  );
}
