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

type InterviewReportRow = {
  user_id: string;
  report: InterviewReportData;
  created_at: string;
};

function formatSaveError(error: unknown): string {
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

  return "保存面试报告失败，请稍后重试";
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

    const row: InterviewReportRow = {
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
