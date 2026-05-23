import type { MatchCase } from "../types";
import PdfImageViewer from "./PdfImageViewer";
import ScoreBadge from "./ScoreBadge";

export default function EvidenceCompareCard({ item }: { item: MatchCase }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-black text-slate-500">CASE {String(item.caseNo).padStart(2, "0")}</p>
          <h3 className="mt-1 text-2xl font-black text-ink">{item.title}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-600">{item.hitType} · 유사도 {item.similarity}</p>
        </div>
        <ScoreBadge grade={item.grade} score={item.score} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">6월 평가원 국어</span>
            <span className="text-xs font-bold text-slate-500">{item.examQuestionNo}</span>
          </div>
          <PdfImageViewer imageUrl={item.examImageUrl} highlights={item.examHighlights} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded bg-red-50 px-2 py-1 text-xs font-black text-red-700">회사 콘텐츠</span>
            <span className="text-xs font-bold text-slate-500">{item.companyLabel} · {item.companyQuestionNo}</span>
          </div>
          <PdfImageViewer imageUrl={item.companyImageUrl} highlights={item.companyHighlights} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-3">
        <div>
          <h4 className="text-sm font-black text-ink">AI 분석 요약</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.aiSummary}</p>
        </div>
        <div>
          <h4 className="text-sm font-black text-ink">왜 적중으로 볼 수 있는가</h4>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
            {item.evidencePoints.map((point) => <li key={point}>· {point}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-black text-ink">학생 체감 효과</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.studentBenefit}</p>
        </div>
      </div>
      <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">{item.caution}</p>
    </article>
  );
}
