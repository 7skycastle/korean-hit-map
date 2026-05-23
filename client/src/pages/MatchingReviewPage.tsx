import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EvidenceCompareCard from "../components/EvidenceCompareCard";
import type { Grade, MatchCase, Report } from "../types";

const grades = ["S", "A", "B", "C", "D", "E"] as const;

export default function MatchingReviewPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState<Report | null>(null);

  const load = () => fetch(`/api/reports/${reportId}`).then((res) => res.json()).then(setReport);
  useEffect(() => { load(); }, [reportId]);

  const patch = async (item: MatchCase, body: Partial<MatchCase>) => {
    await fetch(`/api/matches/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    await load();
  };

  if (!report) return <p className="text-slate-500">리포트를 불러오는 중입니다.</p>;

  return (
    <div className="space-y-5">
      <section className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-ink">매칭 후보 검수</h2>
          <p className="mt-2 text-slate-600">관리자는 등급과 공개 여부를 조정할 수 있으며, 승인된 케이스만 최종 리포트에 포함됩니다.</p>
        </div>
        <Link className="btn-primary" to={`/report/${report.id}`}>최종 리포트 보기</Link>
      </section>

      {report.cases.map((item) => (
        <section key={item.id} className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-report">
            <span className="text-sm font-black text-slate-500">CASE {String(item.caseNo).padStart(2, "0")}</span>
            <select className="field max-w-28" value={item.grade} onChange={(e) => patch(item, { grade: e.target.value as Grade })}>
              {grades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
            </select>
            <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={item.approved} onChange={(e) => patch(item, { approved: e.target.checked })} />
              공개 승인
            </label>
            <input className="field min-w-80 flex-1" value={item.aiSummary} onChange={(e) => setReport({ ...report, cases: report.cases.map((row) => row.id === item.id ? { ...row, aiSummary: e.target.value } : row) })} onBlur={(e) => patch(item, { aiSummary: e.target.value })} />
          </div>
          <EvidenceCompareCard item={item} />
        </section>
      ))}
    </div>
  );
}
