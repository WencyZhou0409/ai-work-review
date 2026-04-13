export interface Project {
  id: number;
  name: string;
  goal: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface FragmentFact {
  id: number;
  fragment_id: number;
  category: string;
  fact_text: string;
  created_at: string;
}

export interface Fragment {
  id: number;
  project_id: number;
  raw_content: string;
  source_type: "text" | "voice" | "document";
  status: "active" | "ignored";
  created_at: string;
  updated_at: string;
  facts?: FragmentFact[];
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface ReviewResult {
  report_mode: string;
  resume_mode: string;
}
