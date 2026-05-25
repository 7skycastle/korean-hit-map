import type { ContentFile, ExamFile, Grade, MatchCase, Report } from "../types";

const scores: Record<Grade, number> = { S: 100, A: 85, B: 70, C: 55, D: 40, E: 20 };
const rules = [
  { title: "문학 작품 직접 적중", grade: "S" as Grade, hitType: "실전 체감 적중", similarity: 94 },
  { title: "독서 배경지식 시간 단축 적중", grade: "A" as Grade, hitType: "시간 단축 적중", similarity: 86 },
  { title: "독서 제재 확장 연계", grade: "B" as Grade, hitType: "확장 연계 적중", similarity: 78 },
  { title: "보기 적용형 문항 구조 적중", grade: "C" as Grade, hitType: "문항 구조 적중", similarity: 71 },
  { title: "선지 함정 판단 기준 적중", grade: "D" as Grade, hitType: "선지 판단 적중", similarity: 66 },
  { title: "동일 소재권 유사", grade: "E" as Grade, hitType: "소재권 유사", similarity: 49 }
];

function markdownFor(title: string, description = "") {
  return [
    `# ${title}`,
    "",
    description ? `설명: ${description}` : "",
    "",
    "## 변환 텍스트",
    "",
    `${title} 파일을 Markdown으로 변환한 프로토타입 텍스트입니다.`,
    "작품·제재·핵심 개념·문항 구조·선지 판단 기준을 규칙별로 비교합니다."
  ]
    .filter(Boolean)
    .join("\n");
}

function excerpt(markdown = "", maxLength = 650) {
  return markdown.length > maxLength ? `${markdown.slice(0, maxLength)}...` : markdown;
}

function emptyImagePaths() {
  return ["", "", ""];
}

function tokenize(text = ""): string[] {
  return (text.match(/[가-힣A-Za-z0-9]{2,}/g) || []).map((token) => token.toLowerCase());
}

function sharedKeywords(a = "", b = "", max = 6): string[] {
  const aSet = new Set(tokenize(a));
  const bSet = new Set(tokenize(b));
  return [...aSet].filter((token) => bSet.has(token)).slice(0, max);
}

function findEvidence(markdown = "", keywords: string[]): string {
  const sentences = markdown
    .replace(/\n/g, " ")
    .split(/[.!?]|다\./)
    .map((value) => value.trim())
    .filter(Boolean);
  for (const sentence of sentences) {
    if (keywords.some((keyword) => sentence.includes(keyword))) return sentence;
  }
  return sentences[0] || "근거 문장을 찾지 못했습니다.";
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
          imagePaths: emptyImagePaths(),
          markdownContent: markdownFor("등록된 회사 콘텐츠 없음"),
          createdAt: new Date().toISOString()
        } satisfies ContentFile
      ];

  const cases: MatchCase[] = rules.map((rule, index) => {
    const content = candidates[index % candidates.length];
    const grade = rule.grade;
    const examQuestionNo = `${18 + index}번`;
    const companyQuestionNo = `${index + 1}번 후보`;
    const keywords = sharedKeywords(exam.markdownContent || "", content.markdownContent || "");
    const keywordText = keywords.length ? keywords.join(", ") : "공통 핵심어 부족";
    const examEvidence = findEvidence(exam.markdownContent || "", keywords);
    const companyEvidence = findEvidence(content.markdownContent || "", keywords);
    const similarityReason = `${rule.title} 기준으로 평가원 ${examQuestionNo}와 회사 콘텐츠 ${companyQuestionNo}를 비교했습니다. 공통 키워드(${keywordText})와 근거 문장을 함께 제시합니다.`;

    return {
      id: `static-match-${Date.now()}-${index + 1}`,
      caseNo: index + 1,
      title: rule.title,
      examId: exam.id,
      companyContentId: content.id,
      examLabel: exam.title,
      companyLabel: content.title,
      examImageUrl: "",
      companyImageUrl: "",
      examMarkdownExcerpt: excerpt(exam.markdownContent),
      companyMarkdownExcerpt: excerpt(content.markdownContent),
      markdownComparison: `${similarityReason}\n평가원 근거: ${examEvidence}\n회사 콘텐츠 근거: ${companyEvidence}`,
      examQuestionNo,
      companyQuestionNo,
      grade,
      score: scores[grade],
      similarity: rule.similarity,
      hitType: rule.hitType,
      hitTypeDescription: rule.title,
      aiSummary: similarityReason,
      questionPairSummary: `평가원 ${examQuestionNo} ↔ 회사 ${companyQuestionNo}`,
      similarityReason,
      sharedKeywords: keywords,
      examEvidence,
      companyEvidence,
      evidencePoints: [
        `비교 문항: 평가원 ${examQuestionNo} / 회사 ${companyQuestionNo}`,
        `공통 키워드: ${keywordText}`,
        `평가원 근거 문장: ${examEvidence}`,
        `회사 근거 문장: ${companyEvidence}`
      ],
      studentBenefit: "학생은 사전 학습한 구조를 이용해 지문 이해와 선지 판단 속도를 높일 수 있습니다.",
      caution:
        "본 분석은 동일 문항 출제를 의미하지 않습니다. 학생이 시험장에서 체감할 수 있는 연계 요소와 학습 효과를 분석한 자료입니다.",
      examHighlights: [],
      companyHighlights: [],
      approved: index < 5
    };
  });

  return {
    id: `static-report-${Date.now()}`,
    title: `${exam.title} 콘텐츠 적중 분석 리포트`,
    examId: exam.id,
    createdAt: new Date().toISOString(),
    totalScore: 76,
    totalCases: cases.length,
    gradeCounts: { S: 1, A: 1, B: 1, C: 1, D: 1, E: 1 },
    cases
  };
}

function isDelete(input: RequestInfo | URL, init?: RequestInit) {
  return (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase() === "DELETE";
}

function defaultExam(): ExamFile {
  return {
    id: "static-exam",
    title: "평가원 국어",
    examDate: "",
    fileName: "exam.pdf",
    originalPdfPath: "",
    imagePaths: emptyImagePaths(),
    markdownContent: markdownFor("평가원 국어"),
    createdAt: new Date().toISOString()
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
          imagePaths: emptyImagePaths(),
          markdownContent: markdownFor(title, description),
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
        imagePaths: emptyImagePaths(),
        markdownContent: markdownFor(title),
        createdAt: new Date().toISOString()
      };
      exams.unshift(exam);
      return Response.json(exam);
    }

    if (path.includes("/analyze")) {
      const report = buildReport(exams[0] ?? defaultExam(), company);
      reports = [report];
      return Response.json(report);
    }

    return Response.json({ ok: true });
  };
}
