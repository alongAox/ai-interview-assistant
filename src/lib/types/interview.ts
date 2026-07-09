import type { ResumeAnalysisFields } from "@/lib/types/analysis";

export type InterviewQuestionsResult = {
  questions: string[];
};

export type WorkflowResult = {
  fileName: string;
  analysis: ResumeAnalysisFields;
  questions: string[];
};
