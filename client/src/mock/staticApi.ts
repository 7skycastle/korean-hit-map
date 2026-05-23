import type { ContentFile, ExamFile, Grade, Highlight, MatchCase, Report } from "../types";

const grades: Grade[] = ["S", "B", "C", "D", "A", "B", "A", "E"];
const titles = ["문학 작품 직접 적중", "독서 제재 확장 연계", "보기 적용형 문항 구조 적중", "선지 함정 판단 기준 적중", "독서 배경지식 시간 단축 적중", "현대시 정서·표현 방식 연계", "고전소설 인물 관계 구조 연계", "동일 소재권 유사"];
const hitTypes = ["실전 체감 적중", "확장 연계 적중", "문항 구조 적중", "선지 판단 적중", "시간 단축 적중", "확장 연계 적중", "시간 단축 적중", "소재권 유사"];
const scores: Record<Grade, number> = { S: 100, A: 85, B: 70, C: 55, D: 40, E: 20 };
const similarities = [94, 78, 71, 66, 86, 75, 83, 49];

function pageSvg(target: "exam" | "company", page: number) {
  const title = target === "exam" ? "6월 평가원 국어" : "회사 콘텐츠";
  const accent = target === "exam" ? "#1d4ed8" : "#991b1b";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><rect width="900" height="1200" fill="#fff"/><rect x="54" y="42" width="792" height="1116" fill="#fff" stroke="#d6dae3" stroke-width="2"/><text x="84" y="105" font-family="Arial" font-size="30" font-weight="700" fill="${accent}">${title}</text><text x="730" y="105" font-family="Arial" font-size="22" fill="#667085">page ${page}</text><line x1="84" y1="132" x2="816" y2="132" stroke="#d6dae3" stroke-width="2"/><text x="84" y="190" font-family="Arial" font-size="23" font-weight="700" fill="#111827">[${14 + page}~${16 + page}] 다음 글을 읽고 물음에 답하시오.</text><foreignObject x="84" y="232" width="730" height="480"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial;font-size:25px;line-height:1.85;color:#273142">실제 PDF 캡처를 대체하는 프로토타입 이미지입니다. 지문 핵심 개념, 문항 구조, 선지 판단 기준을 하이라이트로 비교합니다.</div></foreignObject><rect x="84" y="760" width="730" height="1" fill="#e5e7eb"/><text x="84" y="815" font-family="Arial" font-size="24" fill="#111827">① 개념의 적용 범위를 과도하게 확장한 설명</text><text x="84" y="870" font-family="Arial" font-size="24" fill="#111827">② 원인과 결과의 관계를 뒤바꾼 설명</text><text x="84" y="925" font-family="Arial" font-size="24" fill="#111827">③ 보기의 조건을 충실히 반영한 설명</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function highlights(n: number): Highlight[] {
  return [
    { id: `h-${n}-1`, type: n % 2 ? "box" : "underline", color: n % 2 ? "red" : "yellow", x: 10, y: 20, width: 66, height: n % 2 ? 24 : 5, label: n % 2 ? "직접 연계" : "핵심 개념" },
    { id: `h-${n}-2`, type: "box", color: "blue", x: 11, y: 63, width: 68, height: 14, label: "문항 구조" }
  ];
}

function buildReport(exam: ExamFile): Report {
  const cases: MatchCase[] = titles.map((title, index) => {
    const grade = grades[index];
    return {
      id: `static-match-${index + 1}`,
      caseNo: index + 1,
      title,
      examId: exam.id,
      companyContentId: "static-company",
      examLabel: exam.title,
      companyLabel: "샘플 회사 콘텐츠",
      examImageUrl: pageSvg("exam", (index % 3) + 1),
      companyImageUrl: pageSvg("company", (index % 3) + 1),
      examQuestionNo: `${18 + index}번`,
      companyQuestionNo: `${index + 1}회 ${10 + index}번`,
      grade,
      score: scores[grade],
      similarity: similarities[index],
      hitType: hitTypes[index],
      hitTypeDescription: hitTypes[index],
      aiSummary: "평가원 지문과 회사 콘텐츠가 단순 키워드가 아니라 작품·제재·핵심 개념·문항 구조·선지 판단 기준에서 연결됩니다.",
      evidencePoints: ["핵심 정보 관계가 연결됩니다.", "문항 적용 절차가 유사합니다.", "시험장에서의 낯섦을 낮출 수 있습니다."],
      studentBenefit: "사전 학습자는 지문 이해 시간을 줄이고 선지 판단에 더 많은 시간을 사용할 수 있습니다.",
      caution: "이 분석은 동일 문항 출제를 의미하지 않으며, 실제 시험에서 체감 가능한 연계 요소를 분석한 것입니다.",
      examHighlights: highlights(index + 1),
      companyHighlights: highlights(index + 2),
      approved: index < 6
    };
  });
  return {
    id: "static-report",
    title: `${exam.title} 콘텐츠 적중 분석 리포트`,
    examId: exam.id,
    createdAt: new Date().toISOString(),
    totalScore: 75,
    totalCases: cases.length,
    gradeCounts: { S: 1, A: 2, B: 2, C: 1, D: 1, E: 1 },
    cases
  };
}

export function installStaticApi() {
  if (!window.location.hostname.endsWith("github.io")) return;
  const company: ContentFile[] = [];
  const exams: ExamFile[] = [];
  let reports: Report[] = [];
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
    if (!url.includes("/api/")) return originalFetch(input, init);
    const path = new URL(url, window.location.href).pathname.replace(/^\/korean-hit-map\/api/, "/api").replace(/^\/api/, "");
    if (path === "/company") return Response.json(company);
    if (path === "/exams") return Response.json(exams);
    if (path === "/reports") return Response.json(reports);
    if (path.startsWith("/reports/")) return Response.json(reports[0] ?? buildReport({ id: "static-exam", title: "2026학년도 6월 평가원 국어", examDate: "2025-06-04", fileName: "sample.pdf", originalPdfPath: "", imagePaths: [], createdAt: new Date().toISOString() }));
    if (path === "/company/upload") {
      company.unshift({ id: `static-company-${Date.now()}`, title: "업로드된 회사 콘텐츠", type: "mock_exam", area: "common", fileName: "sample.pdf", originalPdfPath: "", imagePaths: [], createdAt: new Date().toISOString() });
      return Response.json(company[0]);
    }
    if (path === "/exam/upload") {
      exams.unshift({ id: `static-exam-${Date.now()}`, title: "2026학년도 6월 평가원 국어", examDate: "2025-06-04", fileName: "exam.pdf", originalPdfPath: "", imagePaths: [], createdAt: new Date().toISOString() });
      return Response.json(exams[0]);
    }
    if (path.includes("/analyze")) {
      const report = buildReport(exams[0] ?? { id: "static-exam", title: "2026학년도 6월 평가원 국어", examDate: "2025-06-04", fileName: "", originalPdfPath: "", imagePaths: [], createdAt: new Date().toISOString() });
      reports = [report];
      return Response.json(report);
    }
    return Response.json({ ok: true });
  };
}
