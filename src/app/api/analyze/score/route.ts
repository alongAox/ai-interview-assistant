import { NextResponse } from "next/server";
import { scoreInterviewAnswer } from "@/lib/ai/steps/score-answer";
import type { InterviewScoreInput } from "@/lib/types/score";

type ScoreRequestBody = {
  items?: InterviewScoreInput[];
};

/** 对面试问答进行 AI 评分，支持批量（含未作答题目） */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScoreRequestBody;
    const items = body.items?.filter((item) => item.question?.trim());

    if (!items?.length) {
      return NextResponse.json(
        { error: "缺少有效的面试问题" },
        { status: 400 },
      );
    }

    const scores = await Promise.all(
      items.map((item) => scoreInterviewAnswer(item)),
    );

    const averageScore =
      scores.reduce((sum, item) => sum + item.score, 0) / scores.length;

    return NextResponse.json({
      scores,
      averageScore: Math.round(averageScore * 10) / 10,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "评分失败，请稍后重试";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
