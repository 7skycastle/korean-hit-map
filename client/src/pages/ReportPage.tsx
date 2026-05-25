import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EvidenceCompareCard from "../components/EvidenceCompareCard";
import MatchSummaryCard from "../components/MatchSummaryCard";
import type { Report } from "../types";

export default function ReportPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (reportId === "latest") {
      fetch("/api/reports")
        .then((res) => res.json())
        .then((reports: Report[]) => {
          if (reports[0]) navigate(`/report/${reports[0].id}`, { replace: true });
        });
      return;
    }
    fetch(`/api/reports/${reportId}`).then((res) => res.json()).then(setReport);
  }, [reportId, navigate]);

  const approvedReport = useMemo(() => {
    if (!report) return null;
    const cases = report.cases.filter((item) => item.approved);
    const gradeCounts = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
    cases.forEach((item) => {
      gradeCounts[item.grade] += 1;
    });
    return { ...report, totalCases: cases.length, gradeCounts, cases };
  }, [report]);

  if (!approvedReport) return <p className="text-slate-500">리포트를 불러오는 중입니다.</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-report">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-slate-500">공개용 분석 리포트</p>
            <h2 className="mt-1 text-3xl font-black text-ink">{approvedReport.title}</h2>
            <p className="mt-3 max-w-4xl text-slate-600">
              이 리포트는 단순 키워드 일치가 아니라, 실제 시험장에서 체감 가능한 작품·제재·핵심 개념·문항 구조·선지 판단 기준의 연결성을 분석합니다.
            </p>
          </div>
          <Link className="btn-secondary" to={`/review/${approvedReport.id}`}>
            검수 화면
          </Link>
        </div>
        <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600 md:grid-cols-3">
          <span>시험명: {approvedReport.title.replace(" 콘텐츠 적중 분석 리포트", "")}</span>
          <span>분석일: {new Date(approvedReport.createdAt).toLocaleDateString()}</span>
          <span>총 적중 케이스: {approvedReport.totalCases}건</span>
        </div>
      </section>

      <MatchSummaryCard report={approvedReport} />

      <div className="space-y-6">{approvedReport.cases.map((item) => <EvidenceCompareCard key={item.id} item={item} />)}</div>

      <p className="rounded-md bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
        본 분석은 동일 문항 출제를 의미하지 않습니다. 학생이 시험장에서 체감할 수 있는 연계 요소와 학습 효과를 분석한 자료입니다.
      </p>
    </div>
  );
}
