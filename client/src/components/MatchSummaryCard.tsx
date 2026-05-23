import type { Report } from "../types";
import ScoreBadge from "./ScoreBadge";

const grades = ["S", "A", "B", "C", "D", "E"] as const;

export default function MatchSummaryCard({ report }: { report: Report }) {
  return (
    <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-report md:grid-cols-[1.1fr_2fr]">
      <div>
        <p className="text-sm font-bold text-slate-500">전체 연계 체감도</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-5xl font-black text-ink">{report.totalScore}</span>
          <span className="pb-2 text-sm font-bold text-slate-500">/ 100</span>
        </div>
        <p className="mt-3 text-sm text-slate-600">총 {report.totalCases}개 적중 케이스 분석</p>
      </div>
      <div className="grid grid-cols-6 gap-3">
        {grades.map((grade) => (
          <div key={grade} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-center">
            <ScoreBadge grade={grade} />
            <p className="mt-2 text-2xl font-black text-ink">{report.gradeCounts[grade]}</p>
            <p className="text-xs font-bold text-slate-500">건</p>
          </div>
        ))}
      </div>
    </section>
  );
}
