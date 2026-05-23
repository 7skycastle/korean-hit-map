import type { Grade, MatchCase, Report } from "./types.js";

const gradeScores: Record<Grade, number> = { S: 100, A: 85, B: 70, C: 55, D: 40, E: 20 };
const weights: Record<Grade, number> = { S: 1.4, A: 1.4, B: 1.2, C: 1, D: 1, E: 0.6 };

export function scoreForGrade(grade: Grade): number {
  return gradeScores[grade];
}

export function buildReport(examId: string, examTitle: string, cases: MatchCase[]): Report {
  const gradeCounts: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
  cases.forEach((item) => {
    gradeCounts[item.grade] += 1;
  });

  const weighted = cases.reduce(
    (acc, item) => {
      acc.sum += item.score * weights[item.grade];
      acc.weight += weights[item.grade];
      return acc;
    },
    { sum: 0, weight: 0 }
  );

  return {
    id: `report-${examId}-${Date.now()}`,
    title: `${examTitle} 콘텐츠 적중 분석 리포트`,
    examId,
    createdAt: new Date().toISOString(),
    totalScore: Math.round(weighted.sum / Math.max(weighted.weight, 1)),
    totalCases: cases.length,
    gradeCounts,
    cases
  };
}
