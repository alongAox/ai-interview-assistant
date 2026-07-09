export const SAMPLE_INTERVIEW_QUESTIONS = [
  "请介绍一下你最近负责的一个项目，以及你在其中的核心职责。",
  "项目中遇到的最大技术挑战是什么？你是如何解决的？",
  "你常用的技术栈有哪些？请结合项目说明使用场景。",
  "如何保证代码质量和可维护性？",
  "描述一次与团队成员意见不一致的经历，你如何处理？",
  "你如何评估一个需求的优先级？",
  "如果线上出现紧急故障，你的排查思路是什么？",
  "你如何做性能优化？请举一个具体例子。",
  "未来 1-2 年你的职业规划是什么？",
  "为什么选择这个岗位？你认为自己最大的优势是什么？",
];

export const INTERVIEW_QUESTIONS_KEY = "interview-questions";

export function getInterviewQuestions(): string[] {
  if (typeof window === "undefined") {
    return SAMPLE_INTERVIEW_QUESTIONS;
  }

  try {
    const stored = sessionStorage.getItem(INTERVIEW_QUESTIONS_KEY);
    if (!stored) {
      return SAMPLE_INTERVIEW_QUESTIONS;
    }

    const parsed = JSON.parse(stored) as string[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fall through to sample questions
  }

  return SAMPLE_INTERVIEW_QUESTIONS;
}

export function saveInterviewQuestions(questions: string[]) {
  sessionStorage.setItem(INTERVIEW_QUESTIONS_KEY, JSON.stringify(questions));
}
