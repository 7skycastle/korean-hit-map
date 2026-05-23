import { useEffect, useState } from "react";
import UploadBox from "../components/UploadBox";
import type { ContentFile } from "../types";

export default function CompanyUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ContentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", type: "mock_exam", area: "common", round: "", publishMonth: "", description: "" });

  const load = () => fetch("/api/company").then((res) => res.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!files.length) return;
    setLoading(true);
    const data = new FormData();
    files.forEach((file) => data.append("files", file));
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    await fetch("/api/company/upload", { method: "POST", body: data });
    setFiles([]);
    setForm({ title: "", type: "mock_exam", area: "common", round: "", publishMonth: "", description: "" });
    await load();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-3xl font-black text-ink">회사 콘텐츠 업로드</h2>
        <p className="mt-2 max-w-3xl text-slate-600">회사 콘텐츠는 사전에 등록해두고, 평가원 PDF만 업로드하면 자동으로 매칭 후보를 생성합니다.</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
          <UploadBox multiple onFiles={setFiles} />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input className="field" placeholder="콘텐츠명" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="field" placeholder="회차" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} />
            <input className="field" placeholder="발행월 예: 2026-05" value={form.publishMonth} onChange={(e) => setForm({ ...form, publishMonth: e.target.value })} />
            <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="mock_exam">실전 모의고사</option>
              <option value="ebs_variant">EBS 변형 콘텐츠</option>
              <option value="background">독서 배경지식</option>
              <option value="literature">문학 작품 정리</option>
              <option value="weekly">주간지</option>
              <option value="solution">해설지</option>
              <option value="etc">기타</option>
            </select>
            <select className="field" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
              <option value="reading">독서</option>
              <option value="literature">문학</option>
              <option value="elective">선택</option>
              <option value="common">공통</option>
              <option value="etc">기타</option>
            </select>
            <textarea className="field md:col-span-2" rows={4} placeholder="설명" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn-primary mt-5" disabled={loading || !files.length} onClick={submit}>{loading ? "업로드 중" : "회사 콘텐츠 저장"}</button>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
          <h3 className="text-lg font-black text-ink">등록된 파일</h3>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-md bg-slate-50 p-3">
                <p className="font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.fileName} · {item.area} · {item.type}</p>
              </div>
            ))}
            {!items.length ? <p className="text-sm text-slate-500">등록된 콘텐츠가 없습니다.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
