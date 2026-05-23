import type { Grade } from "../types";

const styles: Record<Grade, string> = {
  S: "bg-red-700 text-white",
  A: "bg-orange-500 text-white",
  B: "bg-violet-600 text-white",
  C: "bg-blue-600 text-white",
  D: "bg-emerald-600 text-white",
  E: "bg-slate-500 text-white"
};

export default function ScoreBadge({ grade, score }: { grade: Grade; score?: number }) {
  return (
    <span className={`inline-flex min-w-14 items-center justify-center rounded-md px-3 py-1 text-sm font-black ${styles[grade]}`}>
      {grade}
      {typeof score === "number" ? <span className="ml-1 text-xs font-semibold opacity-90">{score}</span> : null}
    </span>
  );
}
