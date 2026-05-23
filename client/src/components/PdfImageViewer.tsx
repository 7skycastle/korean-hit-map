import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { Highlight } from "../types";
import HighlightOverlay from "./HighlightOverlay";

export default function PdfImageViewer({ imageUrl, highlights }: { imageUrl: string; highlights: Highlight[] }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-100">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
        <span className="text-xs font-bold text-slate-500">PDF 캡처</span>
        <div className="flex items-center gap-1">
          <button className="rounded p-1 hover:bg-slate-100" title="축소" onClick={() => setZoom((value) => Math.max(0.75, value - 0.1))}>
            <Minus size={15} />
          </button>
          <span className="w-12 text-center text-xs font-bold text-slate-500">{Math.round(zoom * 100)}%</span>
          <button className="rounded p-1 hover:bg-slate-100" title="확대" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))}>
            <Plus size={15} />
          </button>
        </div>
      </div>
      <div className="max-h-[650px] overflow-auto bg-slate-200 p-4">
        <div className="relative mx-auto origin-top bg-white shadow-sm" style={{ width: `${Math.round(360 * zoom)}px` }}>
          <img src={imageUrl} className="block w-full select-none" />
          <HighlightOverlay highlights={highlights} />
        </div>
      </div>
    </div>
  );
}
