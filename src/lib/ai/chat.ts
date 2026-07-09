import { requireAIClient } from "@/lib/ai/client";

export async function callAIJson<T>(prompt: string): Promise<T> {
  const ai = requireAIClient();

  const completion = await ai.client.chat.completions.create({
    model: ai.model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI 未返回结果");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("AI 返回格式无效");
  }

  return JSON.parse(jsonMatch[0]) as T;
}
