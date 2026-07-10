import type { ResumeAnalysisFields } from "@/lib/types/analysis";
import type { ScoredInterviewItem } from "@/lib/types/score";

const GUEST_SCOPE = "guest";
const WORKFLOW_CACHE_PREFIX = "ai-interview-workflow-cache";
const INTERVIEW_SESSION_CACHE_PREFIX = "ai-interview-interview-session-cache";

/** 用户切换时通知页面重新加载对应 scope 的缓存 */
export const CACHE_SCOPE_CHANGED_EVENT = "ai-interview-cache-scope-changed";

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

let currentUserId: string | null = null;
let legacyMigrated = false;

/** 访客模式：仅内存暂存，刷新页面后丢失，不写入 localStorage */
let guestWorkflowMemory: WorkflowCache | null = null;

/** 设置当前缓存所属用户，null 表示访客 */
export function setCacheUserId(userId: string | null) {
  currentUserId = userId;
}

export function getCacheUserId() {
  return currentUserId;
}

export function isGuestCacheScope() {
  return currentUserId === null;
}

function getScope(userId = currentUserId) {
  return userId ?? GUEST_SCOPE;
}

function workflowKey(scope: string) {
  return `${WORKFLOW_CACHE_PREFIX}:${scope}`;
}

function sessionKey(scope: string) {
  return `${INTERVIEW_SESSION_CACHE_PREFIX}:${scope}`;
}

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

function clearPersistedGuestCache() {
  removeCache(workflowKey(GUEST_SCOPE));
  removeCache(sessionKey(GUEST_SCOPE));
}

/** 清理旧版及访客持久化缓存（访客不再使用 localStorage） */
function migrateLegacyCacheOnce() {
  if (legacyMigrated || typeof window === "undefined") {
    return;
  }

  legacyMigrated = true;
  removeCache(WORKFLOW_CACHE_PREFIX);
  removeCache(INTERVIEW_SESSION_CACHE_PREFIX);
  clearPersistedGuestCache();
}

/** 清除访客临时数据（内存 + 历史 localStorage 残留） */
export function clearGuestTransientData() {
  guestWorkflowMemory = null;
  clearPersistedGuestCache();
}

export function notifyCacheScopeChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CACHE_SCOPE_CHANGED_EVENT));
}

export function getWorkflowCache(): WorkflowCache | null {
  migrateLegacyCacheOnce();

  if (isGuestCacheScope()) {
    return guestWorkflowMemory;
  }

  return readCache<WorkflowCache>(workflowKey(getScope()));
}

export function saveWorkflowCache(data: Omit<WorkflowCache, "cachedAt">) {
  migrateLegacyCacheOnce();

  if (isGuestCacheScope()) {
    guestWorkflowMemory = {
      ...data,
      cachedAt: new Date().toISOString(),
    };
    return;
  }

  writeCache<WorkflowCache>(workflowKey(getScope()), {
    ...data,
    cachedAt: new Date().toISOString(),
  });
}

export function clearWorkflowCache() {
  migrateLegacyCacheOnce();

  if (isGuestCacheScope()) {
    guestWorkflowMemory = null;
    clearPersistedGuestCache();
    return;
  }

  removeCache(workflowKey(getScope()));
}

export function getInterviewSessionCache(): InterviewSessionCache | null {
  migrateLegacyCacheOnce();

  if (isGuestCacheScope()) {
    return null;
  }

  return readCache<InterviewSessionCache>(sessionKey(getScope()));
}

export function saveInterviewSessionCache(
  data: Omit<InterviewSessionCache, "cachedAt">,
) {
  migrateLegacyCacheOnce();

  if (isGuestCacheScope()) {
    return;
  }

  writeCache<InterviewSessionCache>(sessionKey(getScope()), {
    ...data,
    cachedAt: new Date().toISOString(),
  });
}

export function clearInterviewSessionCache() {
  migrateLegacyCacheOnce();

  if (isGuestCacheScope()) {
    return;
  }

  removeCache(sessionKey(getScope()));
}

export function formatCachedTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
