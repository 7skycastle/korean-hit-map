import type { MatchCase } from "../types";
import ScoreBadge from "./ScoreBadge";

function MarkdownPanel({ label, title, body }: { label: string; title: string; body?: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{label}</span>
        <span className="min-w-0 break-words text-right text-xs font-bold text-slate-500">{title}</span>
      </div>
      <pre className="max-h-[420px] whitespace-pre-wrap break-words p-4 text-sm leading-6 text-slate-700">
        {body || "Markdown 변환 텍스트가 없습니다."}
      </pre>
    </div>
  );
}

function SimilarityTable({ item }: { item: MatchCase }) {
  const keywordText = item.sharedKeywords?.length ? item.sharedKeywords.join(", ") : "공통 핵심어 부족";

  return (
    <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
      <div className="grid grid-cols-1 divide-y divide-slate-200 text-sm md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="bg-slate-50 p-3 font-black text-slate-700">평가원 문항</div>
        <div className="p-3 text-slate-700">{item.examQuestionNo || "-"}</div>
        <div className="bg-slate-50 p-3 font-black text-slate-700">회사 유사 문항</div>
        <div className="p-3 text-slate-700">{item.companyQuestionNo || "-"}</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-200 text-sm md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="bg-slate-50 p-3 font-black text-slate-700">공통 키워드</div>
        <div className="p-3 text-slate-700 md:col-span-3">{keywordText}</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-200 text-sm md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="bg-slate-50 p-3 font-black text-slate-700">유사 판단 근거</div>
        <div className="p-3 text-slate-700 md:col-span-3">{item.similarityReason || item.aiSummary}</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-200 text-sm md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="bg-slate-50 p-3 font-black text-slate-700">평가원 근거 문장</div>
        <div className="p-3 text-slate-700 md:col-span-3">{item.examEvidence || "-"}</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-200 text-sm md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="bg-slate-50 p-3 font-black text-slate-700">회사 근거 문장</div>
        <div className="p-3 text-slate-700 md:col-span-3">{item.companyEvidence || "-"}</div>
      </div>
    </div>
  );
}

export default function EvidenceCompareCard({ item }: { item: MatchCase }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-black text-slate-500">CASE {String(item.caseNo).padStart(2, "0")}</p>
          <h3 className="mt-1 text-2xl font-black text-ink">{item.title}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {item.hitType} · 유사도 {item.similarity}
          </p>
        </div>
        <ScoreBadge grade={item.grade} score={item.score} />
      </div>

      <SimilarityTable item={item} />

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <MarkdownPanel label="평가원 Markdown" title={`${item.examLabel} · ${item.examQuestionNo ?? ""}`} body={item.examMarkdownExcerpt} />
        <MarkdownPanel
          label="회사 콘텐츠 Markdown"
          title={`${item.companyLabel} · ${item.companyQuestionNo ?? ""}`}
          body={item.companyMarkdownExcerpt}
        />
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-3">
        <div>
          <h4 className="text-sm font-black text-ink">분석 요약</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.aiSummary}</p>
        </div>
        <div>
          <h4 className="text-sm font-black text-ink">비교 기준</h4>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
            {item.evidencePoints.map((point) => (
              <li key={point}>· {point}</li>
            ))}
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
