import type { ScoredInterviewItem } from "@/lib/types/score";

export type InterviewReportData = {
  overallScore: number;
  strengths: string;
  weaknesses: string;
  suggestions: string;
  summary: string;
};

export type InterviewReportProps = {
  report: InterviewReportData;
  items?: ScoredInterviewItem[];
  maxScore?: number;
};
