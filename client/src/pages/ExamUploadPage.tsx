import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadBox from "../components/UploadBox";
import type { ExamFile, Report } from "../types";

export default function ExamUploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [exam, setExam] = useState<ExamFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("2026학년도 6월 평가원 국어");
  const [examDate, setExamDate] = useState("2025-06-04");

  const upload = async () => {
    if (!files[0]) return;
    setLoading(true);
    const data = new FormData();
    data.append("file", files[0]);
    data.append("title", title);
    data.append("examDate", examDate);
    const res = await fetch("/api/exam/upload", { method: "POST", body: data });
    setExam(await res.json());
    setLoading(false);
  };

  const analyze = async () => {
    if (!exam) return;
    setLoading(true);
    const res = await fetch(`/api/exam/${exam.id}/analyze`, { method: "POST" });
    const report = (await res.json()) as Report;
    navigate(`/review/${report.id}`);
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-3xl font-black text-ink">평가원 PDF 업로드</h2>
        <p className="mt-2 max-w-3xl text-slate-600">6월 평가원 국어 PDF를 등록한 뒤 분석을 시작하면 회사 콘텐츠와의 mock 매칭 후보 8개가 생성됩니다.</p>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="field" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>
        <div className="mt-5">
          <UploadBox onFiles={setFiles} />
        </div>
        <div className="mt-5 flex gap-2">
          <button className="btn-secondary" disabled={loading || !files[0]} onClick={upload}>{exam ? "다시 업로드" : "업로드"}</button>
          <button className="btn-primary" disabled={loading || !exam} onClick={analyze}>분석 시작</button>
        </div>
        {exam ? <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{exam.fileName} 업로드 완료</p> : null}
      </section>
    </div>
  );
}
