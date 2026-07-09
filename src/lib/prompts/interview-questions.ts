export const INTERVIEW_QUESTIONS_PROMPT = `你是一名资深面试官。

请根据以下简历分析结果，生成 10 道针对性的面试题。

要求：
- 题目应覆盖技术能力、项目经验、优势验证和不足追问
- 难度适中，贴合推荐岗位
- 每道题简洁明确，适合一对一面试

请以 JSON 格式返回，字段名为 questions，值为包含 10 个字符串的数组。

简历分析结果：

{{Analysis}}`;

export function buildInterviewQuestionsPrompt(analysisJson: string) {
  return INTERVIEW_QUESTIONS_PROMPT.replace("{{Analysis}}", analysisJson);
}
