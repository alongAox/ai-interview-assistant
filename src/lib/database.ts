import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { InterviewReportData } from "@/lib/types/report";

/** 写入 Supabase interview_reports 表后的成功结果 */
export type SaveInterviewReportSuccess = {
  ok: true;
  id: string;
  userId: string;
  createdAt: string;
};

/** 保存面试报告的返回类型 */
export type SaveInterviewReportResult =
  | SaveInterviewReportSuccess
  | { ok: false; error: string };

/** 单条面试报告记录 */
export type InterviewReportRecord = {
  id: string;
  userId: string;
  report: InterviewReportData;
  createdAt: string;
};

/** 查询面试报告列表的返回类型 */
export type FetchInterviewReportsResult =
  | { ok: true; items: InterviewReportRecord[] }
  | { ok: false; error: string };

type InterviewReportRow = {
  id: string;
  user_id: string;
  report: InterviewReportData;
  created_at: string;
};

type InterviewReportInsertRow = {
  user_id: string;
  report: InterviewReportData;
  created_at: string;
};

function formatDatabaseError(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const record = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    const parts = [
      record.message,
      record.details,
      record.hint,
      record.code ? `code: ${record.code}` : "",
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" · ");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function formatSaveError(error: unknown): string {
  return formatDatabaseError(error, "保存面试报告失败，请稍后重试");
}

/** 服务端 Admin Client，用于绕过 RLS 写入（仅在 API Route 中使用） */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error("缺少环境变量 NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!secretKey) {
    throw new Error("缺少环境变量 SUPABASE_SECRET_KEY");
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * 将面试报告保存到 Supabase。
 *
 * 依赖表结构（需在 Supabase 中预先创建）：
 * - interview_reports
 *   - id: uuid (primary key, default gen_random_uuid())
 *   - user_id: uuid (references auth.users)
 *   - report: jsonb
 *   - created_at: timestamptz
 */
export async function saveInterviewReport(
  userId: string,
  report: InterviewReportData,
  client: SupabaseClient = supabase,
): Promise<SaveInterviewReportResult> {
  try {
    if (!userId.trim()) {
      throw new Error("缺少 userId");
    }

    if (
      typeof report.overallScore !== "number" ||
      Number.isNaN(report.overallScore)
    ) {
      throw new Error("report.overallScore 无效");
    }

    const createdAt = new Date().toISOString();

    const row: InterviewReportInsertRow = {
      user_id: userId,
      report,
      created_at: createdAt,
    };

    const { data, error } = await client
      .from("interview_reports")
      .insert(row)
      .select("id, user_id, created_at")
      .single();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      throw new Error("保存成功但未返回记录 ID");
    }

    return {
      ok: true,
      id: data.id,
      userId: data.user_id,
      createdAt: data.created_at,
    };
  } catch (error) {
    return {
      ok: false,
      error: formatSaveError(error),
    };
  }
}

/**
 * 查询指定用户的面试报告列表，按 created_at 倒序。
 * 服务端通过 Admin Client 读取，避免客户端 RLS 导致查不到数据。
 */
export async function fetchInterviewReports(
  userId: string,
  client: SupabaseClient,
  limit?: number,
): Promise<FetchInterviewReportsResult> {
  try {
    if (!userId.trim()) {
      throw new Error("缺少 userId");
    }

    let query = client
      .from("interview_reports")
      .select("id, user_id, report, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const items: InterviewReportRecord[] = (data ?? []).map(
      (row: InterviewReportRow) => ({
        id: row.id,
        userId: row.user_id,
        report: row.report,
        createdAt: row.created_at,
      }),
    );

    return { ok: true, items };
  } catch (error) {
    return {
      ok: false,
      error: formatDatabaseError(error, "获取面试历史失败，请稍后重试"),
    };
  }
}
