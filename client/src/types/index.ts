export type Grade = "S" | "A" | "B" | "C" | "D" | "E";

export interface Highlight {
  id: string;
  type: "box" | "underline" | "check" | "note";
  color: "red" | "yellow" | "blue" | "green" | "gray";
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface ContentFile {
  id: string;
  title: string;
  type: "mock_exam" | "ebs_variant" | "background" | "literature" | "weekly" | "solution" | "etc";
  area: "reading" | "literature" | "common" | "elective" | "etc";
  round?: string;
  publishMonth?: string;
  description?: string;
  fileName: string;
  originalPdfPath: string;
  imagePaths: string[];
  createdAt: string;
}

export interface ExamFile {
  id: string;
  title: string;
  examDate: string;
  fileName: string;
  originalPdfPath: string;
  imagePaths: string[];
  createdAt: string;
}

export interface MatchCase {
  id: string;
  caseNo: number;
  title: string;
  examId: string;
  companyContentId: string;
  examLabel: string;
  companyLabel: string;
  examImageUrl: string;
  companyImageUrl: string;
  examQuestionNo?: string;
  companyQuestionNo?: string;
  grade: Grade;
  score: number;
  similarity: number;
  hitType: string;
  hitTypeDescription: string;
  aiSummary: string;
  evidencePoints: string[];
  studentBenefit: string;
  caution: string;
  examHighlights: Highlight[];
  companyHighlights: Highlight[];
  approved: boolean;
}

export interface Report {
  id: string;
  title: string;
  examId: string;
  createdAt: string;
  totalScore: number;
  totalCases: number;
  gradeCounts: Record<Grade, number>;
  cases: MatchCase[];
}
