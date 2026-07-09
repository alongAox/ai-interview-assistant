import { NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/ai/steps/generate-questions";
import type { ResumeAnalysisFields } from "@/lib/types/analysis";

/** 第二步 API：接收第一步分析结果，返回 10 道面试题 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { analysis?: ResumeAnalysisFields };

    if (!body.analysis) {
      return NextResponse.json({ error: "缺少简历分析结果" }, { status: 400 });
    }

    const questions = await generateInterviewQuestions(body.analysis);

    return NextResponse.json({ questions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "面试题生成失败，请稍后重试";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
