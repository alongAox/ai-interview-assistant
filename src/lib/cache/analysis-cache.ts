import type { ResumeAnalysisFields } from "@/lib/types/analysis";
import type { ScoredInterviewItem } from "@/lib/types/score";

const WORKFLOW_CACHE_KEY = "ai-interview-workflow-cache";
const INTERVIEW_SESSION_CACHE_KEY = "ai-interview-interview-session-cache";

export type WorkflowCache = {
  fileName: string;
  fileSize: number;
  analysis: ResumeAnalysisFields;
  questions: string[];
  cachedAt: string;
};

export type InterviewSessionCache = {
  questions: string[];
  answers: string[];
  currentIndex: number;
  completed: boolean;
  scoringState: "idle" | "done" | "error";
  averageScore: number | null;
  scoredItems: ScoredInterviewItem[];
  cachedAt: string;
};

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function removeCache(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(key);
}

export function getWorkflowCache(): WorkflowCache | null {
  return readCache<WorkflowCache>(WORKFLOW_CACHE_KEY);
}

export function saveWorkflowCache(data: Omit<WorkflowCache, "cachedAt">) {
  writeCache<WorkflowCache>(WORKFLOW_CACHE_KEY, {
    ...data,
    cachedAt: new Date().toISOString(),
  });
}

export function clearWorkflowCache() {
  removeCache(WORKFLOW_CACHE_KEY);
}

export function getInterviewSessionCache(): InterviewSessionCache | null {
  return readCache<InterviewSessionCache>(INTERVIEW_SESSION_CACHE_KEY);
}

export function saveInterviewSessionCache(
  data: Omit<InterviewSessionCache, "cachedAt">,
) {
  writeCache<InterviewSessionCache>(INTERVIEW_SESSION_CACHE_KEY, {
    ...data,
    cachedAt: new Date().toISOString(),
  });
}

export function clearInterviewSessionCache() {
  removeCache(INTERVIEW_SESSION_CACHE_KEY);
}

export function formatCachedTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
