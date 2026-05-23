import { ArrowRight, FileText, Layers3, ScrollText, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ContentFile, ExamFile, Report } from "../types";
import ScoreBadge from "../components/ScoreBadge";

const grades = ["S", "A", "B", "C", "D", "E"] as const;

export default function DashboardPage() {
  const [company, setCompany] = useState<ContentFile[]>([]);
  const [exams, setExams] = useState<ExamFile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    Promise.all([fetch("/api/company"), fetch("/api/exams"), fetch("/api/reports")])
      .then(async ([companyRes, examRes, reportRes]) => {
        setCompany(await companyRes.json());
        setExams(await examRes.json());
        setReports(await reportRes.json());
      })
      .catch(() => undefined);
  }, []);

  const gradeCounts = useMemo(() => {
    return reports.reduce(
      (acc, report) => {
        grades.forEach((grade) => {
          acc[grade] += report.gradeCounts?.[grade] ?? 0;
        });
        return acc;
      },
      { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 }
    );
  }, [reports]);

  const avgScore = reports.length ? Math.round(reports.reduce((sum, report) => sum + report.totalScore, 0) / reports.length) : 0;
  const latest = reports[0];

  return (
    <div className="space-y-6">
      <section className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-ink">분석 대시보드</h2>
          <p className="mt-2 max-w-3xl text-slate-600">평가원 국어 PDF와 회사 콘텐츠 PDF를 비교하여, 실제 지문·문항·선지 단위의 연계 체감도를 분석합니다.</p>
        </div>
        <Link className="btn-primary" to="/exam-upload">
          새 평가원 PDF 업로드 <ArrowRight size={17} />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={Layers3} label="회사 콘텐츠" value={company.length} />
        <Metric icon={FileText} label="평가원 PDF" value={exams.length} />
        <Metric icon={ScrollText} label="분석 리포트" value={reports.length} />
        <Metric icon={TrendingUp} label="평균 연계 체감도" value={avgScore} suffix="/100" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
          <h3 className="text-lg font-black text-ink">등급별 건수</h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {grades.map((grade) => (
              <div key={grade} className="rounded-md bg-slate-50 p-3 text-center">
                <ScoreBadge grade={grade} />
                <p className="mt-2 text-2xl font-black">{gradeCounts[grade]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
          <h3 className="text-lg font-black text-ink">최근 분석 결과</h3>
          {latest ? (
            <div className="mt-4 rounded-md bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">{new Date(latest.createdAt).toLocaleString()}</p>
              <p className="mt-1 text-xl font-black text-ink">{latest.title}</p>
              <p className="mt-2 text-sm text-slate-600">전체 연계 체감도 {latest.totalScore}점 · 총 {latest.totalCases}건</p>
              <div className="mt-4 flex gap-2">
                <Link className="btn-secondary" to={`/review/${latest.id}`}>검수</Link>
                <Link className="btn-primary" to={`/report/${latest.id}`}>리포트 보기</Link>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-500">아직 생성된 리포트가 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, suffix = "" }: { icon: typeof Layers3; label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
      <Icon className="text-slate-500" size={22} />
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-ink">{value}<span className="text-base text-slate-400">{suffix}</span></p>
    </div>
  );
}
