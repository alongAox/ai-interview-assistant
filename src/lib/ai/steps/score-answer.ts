import { callAIJson } from "@/lib/ai/chat";
import { buildInterviewScoringPrompt } from "@/lib/prompts/interview-scoring";
import type {
  InterviewScoreInput,
  InterviewScoreResult,
} from "@/lib/types/score";

type RawScore = Partial<InterviewScoreResult>;

function clampScore(score: number) {
  return Math.min(10, Math.max(0, score));
}

function normalizeScore(parsed: RawScore): InterviewScoreResult {
  const score =
    typeof parsed.score === "number" ? clampScore(parsed.score) : 0;

  const strengths = parsed.strengths?.trim();
  const weaknesses = parsed.weaknesses?.trim();
  const suggestions = parsed.suggestions?.trim();

  return {
    score,
    strengths:
      !strengths || strengths === "暂无" ? "无明显优点" : strengths,
    weaknesses: weaknesses || "未指出具体不足",
    suggestions: suggestions || "请针对当前问题给出更完整、更切题的回答",
  };
}

/** 根据面试问题与候选人回答进行 AI 评分（一律调用 AI，由 Prompt 判断关联性） */
export async function scoreInterviewAnswer(
  input: InterviewScoreInput,
): Promise<InterviewScoreResult> {
  const prompt = buildInterviewScoringPrompt(input.question, input.answer);
  const parsed = await callAIJson<RawScore>(prompt, { temperature: 0.1 });
  return normalizeScore(parsed);
}
