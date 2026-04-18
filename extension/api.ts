const BASE_URL = "http://localhost:8002";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<{ code: number; data: T; message: string }> {
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
  return data;
}

export interface Project {
  id: number;
  name: string;
  goal: string | null;
}

export async function listProjects(): Promise<Project[]> {
  const res = await request<Project[]>("/projects");
  return res.data;
}

export interface ExtractedFact {
  category: string;
  fact: string;
}

export async function extractFacts(
  rawText: string,
  projectId: number
): Promise<ExtractedFact[]> {
  const res = await request<{ facts: { category: string; fact_text: string }[] }>(
    "/fragments/extract",
    {
      method: "POST",
      body: JSON.stringify({ raw_text: rawText, project_id: projectId }),
    }
  );
  return res.data.facts.map((f) => ({
    category: f.category,
    fact: f.fact_text,
  }));
}

export async function createFragment(payload: {
  project_id: number;
  raw_content: string;
  source_type: string;
  status: string;
  facts?: { category: string; fact: string }[];
}): Promise<{ id: number }> {
  const res = await request<{ id: number }>("/fragments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}
