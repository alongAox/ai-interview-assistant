export const RESUME_ANALYSIS_PROMPT = `你是一名资深HR。

请分析下面简历。

返回：

1. 工作经验

2. 技术栈

3. 项目经验

4. 优势

5. 不足

6. 推荐岗位

请以 JSON 格式返回，字段名为：
- workExperience
- techStack
- projectExperience
- strengths
- weaknesses
- recommendedRoles

每个字段值为字符串，内容清晰、专业。

简历：

{{Resume}}`;

export function buildResumeAnalysisPrompt(resume: string) {
  return RESUME_ANALYSIS_PROMPT.replace("{{Resume}}", resume);
}
