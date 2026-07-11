import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  saveInterviewReport,
} from "@/lib/database";
import type { InterviewReportData } from "@/lib/types/report";

type SaveReportBody = {
  report?: InterviewReportData;
};

/** 保存面试报告到 Supabase（服务端校验登录态后写入） */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "未授权，请重新登录" }, { status: 401 });
    }

    const token = authHeader.slice("Bearer ".length);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !publishableKey) {
      return NextResponse.json(
        { error: "Supabase 环境变量未配置" },
        { status: 500 },
      );
    }

    const authClient = createClient(url, publishableKey);
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "登录已失效，请重新登录" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as SaveReportBody;

    if (!body.report) {
      return NextResponse.json({ error: "缺少 report 数据" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    const result = await saveInterviewReport(user.id, body.report, adminClient);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "保存面试报告失败，请稍后重试";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
