export type ResumeAnalysisFields = {
  workExperience: string;
  techStack: string;
  projectExperience: string;
  strengths: string;
  weaknesses: string;
  recommendedRoles: string;
};

export type ResumeAnalysisResult = {
  fileName: string;
  analysis: ResumeAnalysisFields;
};

export const ANALYSIS_SECTIONS: {
  key: keyof ResumeAnalysisFields;
  label: string;
}[] = [
  { key: "workExperience", label: "工作经验" },
  { key: "techStack", label: "技术栈" },
  { key: "projectExperience", label: "项目经验" },
  { key: "strengths", label: "优势" },
  { key: "weaknesses", label: "不足" },
  { key: "recommendedRoles", label: "推荐岗位" },
];
