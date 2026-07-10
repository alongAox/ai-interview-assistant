import {
  getWorkflowCache,
  isGuestCacheScope,
  saveWorkflowCache,
} from "@/lib/cache/analysis-cache";
import type { ResumeAnalysisFields } from "@/lib/types/analysis";

export type TargetedInterviewContext = {
  fileName: string;
  analysis: ResumeAnalysisFields;
  questions: string[];
};

/** 是否已完成简历分析并生成针对性面试题 */
export function hasTargetedInterviewQuestions() {
  const workflow = getWorkflowCache();
  return Boolean(
    workflow?.analysis &&
      Array.isArray(workflow.questions) &&
      workflow.questions.length > 0,
  );
}

/** 获取基于简历分析的面试上下文，未就绪时返回 null */
export function getTargetedInterviewContext(): TargetedInterviewContext | null {
  const workflow = getWorkflowCache();

  if (
    !workflow?.analysis ||
    !Array.isArray(workflow.questions) ||
    workflow.questions.length === 0
  ) {
    return null;
  }

  return {
    fileName: workflow.fileName,
    analysis: workflow.analysis,
    questions: workflow.questions,
  };
}

/** 获取针对性面试题；未完成简历分析时返回空数组 */
export function getInterviewQuestions(): string[] {
  return getTargetedInterviewContext()?.questions ?? [];
}

export function saveInterviewQuestions(questions: string[]) {
  if (isGuestCacheScope()) {
    return;
  }

  const workflow = getWorkflowCache();
  if (workflow) {
    saveWorkflowCache({ ...workflow, questions });
  }
}
