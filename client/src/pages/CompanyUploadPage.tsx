import { CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import UploadBox from "../components/UploadBox";
import type { ContentFile } from "../types";

export default function CompanyUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ContentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const load = () => fetch("/api/company").then((res) => res.json()).then(setItems);
  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!files.length) return;
    setLoading(true);
    const data = new FormData();
    files.forEach((file) => data.append("files", file));
    data.append("description", description.trim().slice(0, 10));
    await fetch("/api/company/upload", { method: "POST", body: data });
    setFiles([]);
    setDescription("");
    await load();
    setLoading(false);
  };

  const removeItem = async (id: string) => {
    await fetch(`/api/company/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-3xl font-black text-ink">회사 콘텐츠 업로드</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          회사 콘텐츠는 사전에 등록해두고, 평가원 PDF만 업로드하면 자동으로 매칭 후보를 생성합니다.
        </p>
      </section>

      <section className="grid gap-5" style={{ gridTemplateColumns: "2fr 8fr" }}>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
          <UploadBox multiple onFiles={setFiles} />
          <div className="mt-5 grid gap-3">
            <textarea
              className="field"
              rows={4}
              maxLength={10}
              placeholder="설명"
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, 10))}
            />
          </div>
          <div className="mt-5 flex justify-end">
            <button className="btn-primary" disabled={loading || !files.length} onClick={submit}>
              {loading ? "업로드 중" : "회사 콘텐츠 저장"}
            </button>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-report">
          <div className="mb-3 grid grid-cols-[1fr_140px_64px] items-center gap-3">
            <h3 className="text-3xl font-black text-ink">등록된 파일</h3>
            <p className="text-center text-sm font-semibold text-slate-400">설명 (10자 이내)</p>
            <p className="text-center text-sm font-semibold text-slate-400">삭제</p>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_140px_64px] items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="break-words text-xl font-black leading-6 text-ink">{item.title}</p>
                <p className="text-center text-sm font-semibold text-slate-700">{(item.description || "").slice(0, 10)}</p>
                <div className="flex justify-center">
                  <button className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" title="삭제" onClick={() => removeItem(item.id)}>
                    <CircleX size={20} />
                  </button>
                </div>
              </div>
            ))}
            {!items.length ? <p className="text-sm text-slate-500">등록된 콘텐츠가 없습니다.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
