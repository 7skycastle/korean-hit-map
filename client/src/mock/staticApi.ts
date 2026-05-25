import type { ContentFile, ExamFile, Grade, Highlight, MatchCase, Report } from "../types";

const grades: Grade[] = ["S", "B", "C", "D", "A", "B", "A", "E"];
const titles = [
  "문학 작품 직접 적중",
  "독서 제재 확장 연계",
  "보기 적용형 문항 구조 적중",
  "선지 함정 판단 기준 적중",
  "독서 배경지식 시간 단축 적중",
  "현대시 정서·표현 방식 연계",
  "고전소설 인물 관계 구조 연계",
  "동일 소재권 유사"
];
const hitTypes = ["실전 체감 적중", "확장 연계 적중", "문항 구조 적중", "선지 판단 적중", "시간 단축 적중", "확장 연계 적중", "시간 단축 적중", "소재권 유사"];
const scores: Record<Grade, number> = { S: 100, A: 85, B: 70, C: 55, D: 40, E: 20 };
const similarities = [94, 78, 71, 66, 86, 75, 83, 49];

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrap(value: string, max = 34) {
  const source = value.replace(/\s+/g, " ").trim();
  const lines: string[] = [];
  for (let index = 0; index < source.length; index += max) {
    lines.push(source.slice(index, index + max));
  }
  return lines.slice(0, 12);
}

function pageSvg(target: "exam" | "company", page: number, label: string, description = "") {
  const accent = target === "exam" ? "#1d4ed8" : "#991b1b";
  const heading = target === "exam" ? "평가원 PDF" : "회사 콘텐츠";
  const lines = wrap(`${label} ${description ? `- ${description}` : ""}`);
  const textLines = lines
    .map((line, index) => `<text x="92" y="${300 + index * 34}" font-family="Arial, sans-serif" font-size="24" fill="#1f2937">${escapeXml(line)}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
<rect width="900" height="1200" fill="#fff"/>
<rect x="54" y="42" width="792" height="1116" fill="#fff" stroke="#d6dae3" stroke-width="2"/>
<text x="84" y="105" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${accent}">${escapeXml(heading)}</text>
<text x="730" y="105" font-family="Arial, sans-serif" font-size="22" fill="#667085">page ${page}</text>
<line x1="84" y1="132" x2="816" y2="132" stroke="#d6dae3" stroke-width="2"/>
<text x="84" y="190" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="#111827">업로드 파일 기반 분석 미리보기</text>
<text x="84" y="236" font-family="Arial, sans-serif" font-size="20" fill="#475569">브라우저 배포판에서는 PDF 원문 렌더링 대신 업로드 파일명을 기준으로 분석 후보를 구성합니다.</text>
${textLines}
<rect x="84" y="760" width="730" height="1" fill="#e5e7eb"/>
<text x="84" y="815" font-family="Arial, sans-serif" font-size="24" fill="#111827">① 작품·제재·핵심 개념 연결 여부</text>
<text x="84" y="870" font-family="Arial, sans-serif" font-size="24" fill="#111827">② 발문·보기 적용 방식 유사성</text>
<text x="84" y="925" font-family="Arial, sans-serif" font-size="24" fill="#111827">③ 선지 판단 기준 및 함정 구조</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function imagePaths(target: "exam" | "company", label: string, description = "") {
  return [1, 2, 3].map((page) => pageSvg(target, page, label, description));
}

function highlights(n: number): Highlight[] {
  return [
    { id: `h-${n}-1`, type: n % 2 ? "box" : "underline", color: n % 2 ? "red" : "yellow", x: 10, y: 20, width: 66, height: n % 2 ? 24 : 5, label: n % 2 ? "직접 연계" : "핵심 개념" },
    { id: `h-${n}-2`, type: "box", color: "blue", x: 11, y: 63, width: 68, height: 14, label: "문항 구조" }
  ];
}

function buildReport(exam: ExamFile, companyItems: ContentFile[]): Report {
  const candidates = companyItems.length
    ? companyItems
    : [
        {
          id: "sample-company-content",
          title: "등록된 회사 콘텐츠 없음",
          type: "etc",
          area: "etc",
          fileName: "sample.pdf",
          originalPdfPath: "",
          imagePaths: imagePaths("company", "등록된 회사 콘텐츠 없음"),
          createdAt: new Date().toISOString()
        } satisfies ContentFile
      ];

  const cases: MatchCase[] = titles.map((title, index) => {
    const grade = grades[index];
    const content = candidates[index % candidates.length];
    return {
      id: `static-match-${Date.now()}-${index + 1}`,
      caseNo: index + 1,
      title,
      examId: exam.id,
      companyContentId: content.id,
      examLabel: exam.title,
      companyLabel: content.title,
      examImageUrl: exam.imagePaths[index % exam.imagePaths.length],
      companyImageUrl: content.imagePaths[index % content.imagePaths.length],
      examQuestionNo: `${18 + index}번`,
      companyQuestionNo: `${index + 1}회 ${10 + index}번`,
      grade,
      score: scores[grade],
      similarity: similarities[index],
      hitType: hitTypes[index],
      hitTypeDescription: hitTypes[index],
      aiSummary: `평가원 PDF와 ${content.title} 파일을 기준으로 작품·제재·핵심 개념·문항 구조·선지 판단 기준의 연결 가능성을 mock 분석했습니다.`,
      evidencePoints: ["업로드된 회사 콘텐츠가 매칭 후보에 반영되었습니다.", "파일별 설명과 제목을 기준으로 분석 케이스를 구성했습니다.", "실제 PDF 원문 렌더링/OCR은 서버 배포판에서 확장 가능합니다."],
      studentBenefit: "사전 학습 자료와 평가원 문항 사이의 연결 후보를 검토할 수 있습니다.",
      caution: "이 분석은 동일 문항 출제를 의미하지 않으며, 실제 시험에서 체감 가능한 연계 요소를 분석한 것입니다.",
      examHighlights: highlights(index + 1),
      companyHighlights: highlights(index + 2),
      approved: index < 6
    };
  });

  return {
    id: `static-report-${Date.now()}`,
    title: `${exam.title} 콘텐츠 적중 분석 리포트`,
    examId: exam.id,
    createdAt: new Date().toISOString(),
    totalScore: 75,
    totalCases: cases.length,
    gradeCounts: { S: 1, A: 2, B: 2, C: 1, D: 1, E: 1 },
    cases
  };
}

function isDelete(input: RequestInfo | URL, init?: RequestInit) {
  return (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase() === "DELETE";
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
    if (path.startsWith("/reports/")) return Response.json(reports[0] ?? buildReport(defaultExam(), company));

    if (path === "/company/upload") {
      const request = input instanceof Request ? input : new Request(url, init);
      const form = await request.formData();
      const description = String(form.get("description") || "").slice(0, 10);
      const uploadedFiles = form.getAll("files").filter((item): item is File => item instanceof File);
      const created = uploadedFiles.map((file, index) => {
        const title = file.name.replace(/\.pdf$/i, "");
        return {
          id: `static-company-${Date.now()}-${index}`,
          title,
          type: "etc",
          area: "etc",
          fileName: file.name,
          originalPdfPath: "",
          imagePaths: imagePaths("company", title, description),
          description,
          createdAt: new Date().toISOString()
        } satisfies ContentFile;
      });
      company.unshift(...created);
      return Response.json(created.length === 1 ? created[0] : created);
    }

    if (path.startsWith("/company/") && isDelete(input, init)) {
      const id = path.split("/")[2];
      const index = company.findIndex((item) => item.id === id);
      if (index >= 0) company.splice(index, 1);
      return Response.json({ ok: true });
    }

    if (path === "/exam/upload") {
      const request = input instanceof Request ? input : new Request(url, init);
      const form = await request.formData();
      const file = form.get("file");
      const fileName = file instanceof File ? file.name : "exam.pdf";
      const title = String(form.get("title") || fileName.replace(/\.pdf$/i, "") || "평가원 국어");
      const exam: ExamFile = {
        id: `static-exam-${Date.now()}`,
        title,
        examDate: String(form.get("examDate") || ""),
        fileName,
        originalPdfPath: "",
        imagePaths: imagePaths("exam", title),
        createdAt: new Date().toISOString()
      };
      exams.unshift(exam);
      return Response.json(exam);
    }

    if (path.includes("/analyze")) {
      const exam = exams[0] ?? defaultExam();
      const report = buildReport(exam, company);
      reports = [report];
      return Response.json(report);
    }

    return Response.json({ ok: true });
  };
}

function defaultExam(): ExamFile {
  return {
    id: "static-exam",
    title: "평가원 국어",
    examDate: "",
    fileName: "exam.pdf",
    originalPdfPath: "",
    imagePaths: imagePaths("exam", "평가원 국어"),
    createdAt: new Date().toISOString()
  };
}
