import type { ScoredInterviewItem } from "@/lib/types/score";
import type { InterviewReportData } from "@/lib/types/report";

const EMPTY_VALUES = new Set(["", "无", "无明显优点", "暂无明显不足"]);

function collectUniquePoints(
  items: ScoredInterviewItem[],
  field: "strengths" | "weaknesses" | "suggestions",
  emptyFallback: string,
) {
  const seen = new Set<string>();
  const points: string[] = [];

  for (const item of items) {
    const value = item[field].trim();
    if (EMPTY_VALUES.has(value) || seen.has(value)) {
      continue;
    }
    seen.add(value);
    points.push(value);
  }

  return points.length > 0 ? points.join("\n") : emptyFallback;
}

function buildOneLiner(
  overallScore: number,
  answeredCount: number,
  total: number,
): string {
  if (answeredCount === 0) {
    return "尚未有效作答，建议认真完成每道题后再查看评估结果。";
  }

  if (overallScore >= 8) {
    return "整体表现优秀，基础扎实、表达清晰，可继续深化项目实践与细节描述。";
  }

  if (overallScore >= 6) {
    return "整体表现良好，具备一定基础，重点补强薄弱题型即可进一步提升。";
  }

  if (overallScore >= 3) {
    return `完成 ${answeredCount}/${total} 题，部分回答不够完整或偏离题意，建议回归核心知识点系统复习。`;
  }

  return "回答质量整体偏低，建议先梳理基础知识框架，再针对每类题型反复练习。";
}

/** 将分题评分汇总为最终报告数据（业务层使用，不属于展示组件） */
export function buildInterviewReport(
  overallScore: number,
  items: ScoredInterviewItem[],
): InterviewReportData {
  const answeredCount = items.filter((item) => item.answer.trim()).length;

  return {
    overallScore,
    summary: buildOneLiner(overallScore, answeredCount, items.length),
    strengths: collectUniquePoints(
      items,
      "strengths",
      "暂无显著优势，建议在后续练习中加强回答的完整性与针对性。",
    ),
    weaknesses: collectUniquePoints(
      items,
      "weaknesses",
      "暂无明显不足记录，可继续挑战更高难度的题目。",
    ),
    suggestions: collectUniquePoints(
      items,
      "suggestions",
      "建议结合每道题目，补充更具体的技术细节与实践案例，形成结构化表达习惯。",
    ),
  };
}
