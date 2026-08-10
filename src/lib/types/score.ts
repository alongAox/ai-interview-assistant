export type InterviewScoreResult = {
  score: number;
  strengths: string;
  weaknesses: string;
  suggestions: string;
};

export type InterviewScoreInput = {
  question: string;
  answer: string;
};

export type QuestionScore = InterviewScoreResult & {
  question: string;
  answer: string;
};

export type InterviewScoreResponse = {
  scores: InterviewScoreResult[];
  averageScore: number;
};

export type ScoredInterviewItem = QuestionScore & {
  index: number;
};
