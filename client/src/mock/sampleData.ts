import type { Report } from "../types";

export const emptyReport: Report = {
  id: "empty",
  title: "샘플 리포트",
  examId: "sample",
  createdAt: new Date().toISOString(),
  totalScore: 0,
  totalCases: 0,
  gradeCounts: { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 },
  cases: []
};
