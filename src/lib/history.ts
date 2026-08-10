import { supabase } from "@/lib/supabase";
import type { InterviewReportData } from "@/lib/types/report";

/** 单条面试报告历史记录 */
export type InterviewHistoryItem = {
  id: string;
  userId: string;
  report: InterviewReportData;
  createdAt: string;
};

/** 查询面试报告历史的返回类型 */
export type GetInterviewHistoryResult =
  | { ok: true; items: InterviewHistoryItem[] }
  | { ok: false; error: string };

function formatHistoryError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "获取面试历史失败，请稍后重试";
}

/**
 * 查询当前登录用户的面试报告历史。
 *
 * 通过 /api/reports 服务端读取，避免客户端直连 Supabase 时被 RLS 拦截。
 */
export async function getInterviewHistory(
  limit?: number,
): Promise<GetInterviewHistoryResult> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { ok: false, error: "未登录，请先登录后再查看历史记录" };
    }

    const query =
      limit !== undefined ? `?limit=${encodeURIComponent(String(limit))}` : "";

    const response = await fetch(`/api/reports${query}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = (await response.json()) as {
      items?: InterviewHistoryItem[];
      error?: string;
    };

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || "获取面试历史失败，请稍后重试",
      };
    }

    return { ok: true, items: data.items ?? [] };
  } catch (error) {
    return {
      ok: false,
      error: formatHistoryError(error),
    };
  }
}
