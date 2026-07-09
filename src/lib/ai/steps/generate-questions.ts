import { callAIJson } from "@/lib/ai/chat";
import { buildInterviewQuestionsPrompt } from "@/lib/prompts/interview-questions";
import type { ResumeAnalysisFields } from "@/lib/types/analysis";
import type { InterviewQuestionsResult } from "@/lib/types/interview";

type RawQuestions = {
  questions?: string[];
};

function normalizeQuestions(parsed: RawQuestions): string[] {
  const questions = parsed.questions?.filter(Boolean) ?? [];

  if (questions.length === 0) {
    throw new Error("AI 未返回面试题");
  }

  return questions.slice(0, 10);
}

/** 第二步：基于简历分析结果，生成 10 道针对性面试题 */
export async function generateInterviewQuestions(
  analysis: ResumeAnalysisFields,
): Promise<string[]> {
  const analysisJson = JSON.stringify(analysis, null, 2);
  const prompt = buildInterviewQuestionsPrompt(analysisJson);
  const parsed = await callAIJson<RawQuestions>(prompt);
  return normalizeQuestions(parsed);
}
