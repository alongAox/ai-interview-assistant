import { callAIJson } from "@/lib/ai/chat";
import { buildResumeAnalysisPrompt } from "@/lib/prompts/resume-analysis";
import type { ResumeAnalysisFields } from "@/lib/types/analysis";

type RawAnalysis = Partial<ResumeAnalysisFields>;

function normalizeAnalysis(parsed: RawAnalysis): ResumeAnalysisFields {
  return {
    workExperience: parsed.workExperience ?? "暂无",
    techStack: parsed.techStack ?? "暂无",
    projectExperience: parsed.projectExperience ?? "暂无",
    strengths: parsed.strengths ?? "暂无",
    weaknesses: parsed.weaknesses ?? "暂无",
    recommendedRoles: parsed.recommendedRoles ?? "暂无",
  };
}

/** 第一步：AI 分析简历 */
export async function analyzeResume(
  resumeText: string,
): Promise<ResumeAnalysisFields> {
  const prompt = buildResumeAnalysisPrompt(resumeText);
  const parsed = await callAIJson<RawAnalysis>(prompt);
  return normalizeAnalysis(parsed);
}
