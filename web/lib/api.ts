import type { ApiResponse, Fragment, Project, ReviewResult } from "@/app/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || data.code !== 0) {
    throw new Error(data.detail || data.message || "请求失败");
  }
  return data as ApiResponse<T>;
}

export async function listProjects(): Promise<Project[]> {
  const res = await request<Project[]>("/projects");
  return res.data;
}

export async function createProject(payload: {
  name: string;
  goal?: string;
}): Promise<Project> {
  const res = await request<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function listFragments(projectId: number): Promise<Fragment[]> {
  const res = await request<Fragment[]>(`/fragments?project_id=${projectId}`);
  return res.data;
}

export async function createFragment(payload: {
  project_id: number;
  raw_content: string;
  source_type: string;
  status: string;
  facts?: { category: string; fact: string }[];
}): Promise<Fragment> {
  const res = await request<Fragment>("/fragments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateFragment(
  id: number,
  payload: Partial<Fragment>
): Promise<Fragment> {
  const res = await request<Fragment>(`/fragments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteProject(projectId: number): Promise<void> {
  await request<void>(`/projects/${projectId}`, {
    method: "DELETE",
  });
}

export async function generateReview(
  projectId: number,
  fragmentIds: number[]
): Promise<ReviewResult> {
  const res = await request<ReviewResult>(`/projects/${projectId}/generate`, {
    method: "POST",
    body: JSON.stringify({ fragment_ids: fragmentIds }),
  });
  return res.data;
}
