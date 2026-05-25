import { UploadCloud } from "lucide-react";
import { useState } from "react";

export default function UploadBox({ multiple, onFiles }: { multiple?: boolean; onFiles: (files: File[]) => void }) {
  const [names, setNames] = useState<string[]>([]);

  const acceptFiles = (files: FileList | null) => {
    const selected = Array.from(files ?? []).filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    setNames(selected.map((file) => file.name));
    onFiles(selected);
  };

  return (
    <label
      className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-white px-6 py-8 text-center transition hover:border-slate-500 hover:bg-slate-50"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        acceptFiles(event.dataTransfer.files);
      }}
    >
      <UploadCloud className="mb-3 text-slate-500" size={34} />
      <span className="text-sm font-bold text-ink">PDF 파일을 드래그하거나 클릭해 업로드</span>
      <span className="mt-1 text-xs text-slate-500">여러 PDF를 한 번에 등록할 수 있습니다.</span>
      <input className="hidden" type="file" accept="application/pdf" multiple={multiple} onChange={(event) => acceptFiles(event.target.files)} />
      {names.length > 0 ? (
        <div className="mt-4 flex max-w-full flex-wrap justify-center gap-2">
          {names.map((name) => (
            <span key={name} className="max-w-full break-words rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {name}
            </span>
          ))}
        </div>
      ) : null}
    </label>
  );
}
