const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface GenerateRequest {
  resumeText: string;
  jdText: string;
  companyName?: string;
  researchDepth: number;
}

export interface GenerateResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface ParseResumeResponse {
  success: boolean;
  text: string;
  fileName: string;
  fileType: string;
  pageCount?: number;
}

export interface FetchJDResponse {
  success: boolean;
  text: string;
  url: string;
}

// Start email generation
export async function startGeneration(data: GenerateRequest): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to start generation");
  }

  return response.json();
}

// Parse resume file
export async function parseResume(file: File): Promise<ParseResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/parse-resume`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to parse resume");
  }

  return response.json();
}

// Fetch job description from URL
export async function fetchJobDescription(url: string): Promise<FetchJDResponse> {
  const response = await fetch(`${API_BASE}/api/fetch-jd`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch job description");
  }

  return response.json();
}

// Get SSE stream URL
export function getStreamUrl(jobId: string, researchDepth: number): string {
  return `${API_BASE}/api/stream/${jobId}?depth=${researchDepth}`;
}
