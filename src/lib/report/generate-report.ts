import { buildInterviewReport } from "@/lib/report/build-report";
import type { InterviewReportData } from "@/lib/types/report";
import type { InterviewScoreResult, ScoredInterviewItem } from "@/lib/types/score";

export type ReportInputItem = {
  question: string;
  answer: string;
  index: number;
};

export type GenerateReportSuccess = {
  report: InterviewReportData;
  items: ScoredInterviewItem[];
  averageScore: number;
};

export type GenerateReportResult =
  | { ok: true; data: GenerateReportSuccess }
  | { ok: false; error: string };

function normalizeScoreResult(
  score: InterviewScoreResult | undefined,
): InterviewScoreResult {
  return {
    score: typeof score?.score === "number" && !Number.isNaN(score.score)
      ? score.score
      : 0,
    strengths: score?.strengths?.trim() ?? "",
    weaknesses: score?.weaknesses?.trim() ?? "",
    suggestions: score?.suggestions?.trim() ?? "",
  };
}

/** 请求评分并生成面试报告，包含完整错误处理 */
export async function generateInterviewReport(
  items: ReportInputItem[],
): Promise<GenerateReportResult> {
  try {
    if (!items.length) {
      throw new Error("缺少有效的面试问题");
    }

    const response = await fetch("/api/analyze/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(({ question, answer }) => ({ question, answer })),
      }),
    });

    let data: {
      scores?: InterviewScoreResult[];
      averageScore?: number;
      error?: string;
    };

    try {
      data = (await response.json()) as typeof data;
    } catch {
      throw new Error("报告响应解析失败，请稍后重试");
    }

    if (!response.ok) {
      throw new Error(data.error || "生成报告失败，请稍后重试");
    }

    if (!Array.isArray(data.scores) || data.scores.length !== items.length) {
      throw new Error("评分数据不完整，请重新生成报告");
    }

    if (
      typeof data.averageScore !== "number" ||
      Number.isNaN(data.averageScore)
    ) {
      throw new Error("综合得分无效，请重新生成报告");
    }

    const scoredItems: ScoredInterviewItem[] = items.map((item, scoreIndex) => ({
      index: item.index,
      question: item.question,
      answer: item.answer,
      ...normalizeScoreResult(data.scores![scoreIndex]),
    }));

    const report = buildInterviewReport(data.averageScore, scoredItems);

    return {
      ok: true,
      data: {
        report,
        items: scoredItems,
        averageScore: data.averageScore,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "生成报告失败，请稍后重试",
    };
  }
}

/** 从已有评分数据安全重建报告，用于缓存恢复 */
export function rebuildInterviewReport(
  averageScore: number,
  items: ScoredInterviewItem[],
): GenerateReportResult {
  try {
    const report = buildInterviewReport(averageScore, items);

    return {
      ok: true,
      data: {
        report,
        items,
        averageScore,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "报告数据恢复失败，请重新生成",
    };
  }
}
