import { createAIClient } from "@/lib/ai/client";
import { buildResumeAnalysisPrompt } from "@/lib/prompts/resume-analysis";
import type { ResumeAnalysisFields } from "@/lib/types/analysis";

function parseAnalysisContent(content: string): ResumeAnalysisFields {
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("AI 返回格式无效");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Partial<ResumeAnalysisFields>;

  return {
    workExperience: parsed.workExperience ?? "暂无",
    techStack: parsed.techStack ?? "暂无",
    projectExperience: parsed.projectExperience ?? "暂无",
    strengths: parsed.strengths ?? "暂无",
    weaknesses: parsed.weaknesses ?? "暂无",
    recommendedRoles: parsed.recommendedRoles ?? "暂无",
  };
}

export async function analyzeResume(resumeText: string) {
  const ai = createAIClient();

  if (!ai) {
    throw new Error(
      "未配置 AI API Key，请在 .env.local 中设置 OPENROUTER_API_KEY 或 OPENAI_API_KEY",
    );
  }

  const prompt = buildResumeAnalysisPrompt(resumeText);

  const completion = await ai.client.chat.completions.create({
    model: ai.model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI 未返回分析结果");
  }

  return parseAnalysisContent(content);
}
