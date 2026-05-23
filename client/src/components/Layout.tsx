import { BarChart3, FilePlus2, Layers3, ScrollText } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "대시보드", icon: BarChart3 },
  { to: "/company-upload", label: "회사 콘텐츠", icon: Layers3 },
  { to: "/exam-upload", label: "평가원 업로드", icon: FilePlus2 },
  { to: "/report/latest", label: "리포트", icon: ScrollText }
];

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-black tracking-normal text-ink">국어 콘텐츠 적중 맵</h1>
            <p className="mt-1 text-sm text-slate-500">단순 키워드 유사가 아니라, 실제 지문·작품·문항 구조·선지 판단 기준을 비교합니다.</p>
          </div>
          <nav className="flex gap-2">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                      isActive ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon size={17} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
