import { Check } from "lucide-react";
import type { Highlight } from "../types";

const colorClass = {
  red: "border-red-600 bg-red-500/10 text-red-700",
  yellow: "border-yellow-400 bg-yellow-300/30 text-yellow-800",
  blue: "border-blue-600 bg-blue-500/10 text-blue-700",
  green: "border-emerald-600 bg-emerald-500/10 text-emerald-700",
  gray: "border-slate-400 bg-slate-200/75 text-slate-700"
};

export default function HighlightOverlay({ highlights }: { highlights: Highlight[] }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {highlights.map((item) => {
        const style = { left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%`, height: `${item.height}%` };
        if (item.type === "underline") {
          return <div key={item.id} className={`absolute border-b-4 ${colorClass[item.color]}`} style={style} />;
        }
        if (item.type === "check") {
          return (
            <div key={item.id} className={`absolute flex items-center gap-1 font-bold ${colorClass[item.color]}`} style={style}>
              <Check size={24} strokeWidth={4} />
              {item.label ? <span className="rounded bg-white/90 px-1 text-[10px]">{item.label}</span> : null}
            </div>
          );
        }
        return (
          <div key={item.id} className={`absolute rounded-sm border-2 ${colorClass[item.color]}`} style={style}>
            {item.label ? <span className="absolute -top-6 left-0 rounded bg-white/95 px-2 py-0.5 text-[11px] font-bold shadow">{item.label}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
