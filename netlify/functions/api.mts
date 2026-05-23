import type { Config } from "@netlify/functions";
import { getDeployStore, getStore } from "@netlify/blobs";

type Grade = "S" | "A" | "B" | "C" | "D" | "E";
type Highlight = {
  id: string;
  type: "box" | "underline" | "check" | "note";
  color: "red" | "yellow" | "blue" | "green" | "gray";
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};
type ContentFile = {
  id: string;
  title: string;
  type: string;
  area: string;
  round?: string;
  publishMonth?: string;
  description?: string;
  fileName: string;
  originalPdfPath: string;
  imagePaths: string[];
  createdAt: string;
};
type ExamFile = {
  id: string;
  title: string;
  examDate: string;
  fileName: string;
  originalPdfPath: string;
  imagePaths: string[];
  createdAt: string;
};
type MatchCase = {
  id: string;
  caseNo: number;
  title: string;
  examId: string;
  companyContentId: string;
  examLabel: string;
  companyLabel: string;
  examImageUrl: string;
  companyImageUrl: string;
  examQuestionNo?: string;
  companyQuestionNo?: string;
  grade: Grade;
  score: number;
  similarity: number;
  hitType: string;
  hitTypeDescription: string;
  aiSummary: string;
  evidencePoints: string[];
  studentBenefit: string;
  caution: string;
  examHighlights: Highlight[];
  companyHighlights: Highlight[];
  approved: boolean;
};
type Report = {
  id: string;
  title: string;
  examId: string;
  createdAt: string;
  totalScore: number;
  totalCases: number;
  gradeCounts: Record<Grade, number>;
  cases: MatchCase[];
};

const scores: Record<Grade, number> = { S: 100, A: 85, B: 70, C: 55, D: 40, E: 20 };
const weights: Record<Grade, number> = { S: 1.4, A: 1.4, B: 1.2, C: 1, D: 1, E: 0.6 };
const descriptions: Record<Grade, string> = {
  S: "동일 작품 또는 매우 유사한 지문·제재가 있어 강한 연계 체감이 가능한 경우",
  A: "사전 학습으로 지문 이해 속도가 빨라질 가능성이 높은 경우",
  B: "핵심 개념, 논점, 구조가 사전에 훈련된 경우",
  C: "발문, 보기, 추론 방식, 비교 방식이 유사한 경우",
  D: "선지를 판단하는 기준이나 함정 구조가 유사한 경우",
  E: "같은 분야나 비슷한 소재이나 직접적인 시험 도움은 제한적인 경우"
};
const caution = "이 분석은 동일 문항 출제를 의미하지 않으며, 실제 시험에서 체감 가능한 연계 요소를 분석한 것입니다.";

function store() {
  return Netlify.context?.deploy.context === "production" ? getStore("hit-map-data") : getDeployStore("hit-map-data");
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  return ((await store().get(key, { type: "json" })) as T | null) ?? fallback;
}

async function writeJson<T>(key: string, value: T) {
  await store().setJSON(key, value);
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

function mockImage(target: "exam" | "company", page = "1") {
  const title = target === "exam" ? "6월 평가원 국어" : "회사 콘텐츠";
  const accent = target === "exam" ? "#1d4ed8" : "#991b1b";
  const body = Number(page) % 2 === 0 ? "보기 조건을 지문 개념에 적용하여 결과를 판단하는 문항 구조입니다." : "작품의 갈등 구조와 핵심 개념을 사전에 학습할 수 있는 지문입니다.";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
<rect width="900" height="1200" fill="#fff"/><rect x="54" y="42" width="792" height="1116" fill="#fff" stroke="#d6dae3" stroke-width="2"/>
<text x="84" y="105" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${accent}">${title}</text>
<text x="730" y="105" font-family="Arial, sans-serif" font-size="22" fill="#667085">page ${page}</text><line x1="84" y1="132" x2="816" y2="132" stroke="#d6dae3" stroke-width="2"/>
<text x="84" y="190" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="#111827">[${14 + Number(page)}~${16 + Number(page)}] 다음 글을 읽고 물음에 답하시오.</text>
<foreignObject x="84" y="232" width="730" height="480"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 25px; line-height: 1.85; color: #273142;">${body} 평가원 문항은 표면적인 키워드보다 정보의 관계, 조건 변화, 판단 기준을 묻는다. 이 이미지는 배포 환경에서 PDF 캡처를 대체하는 프로토타입 이미지입니다.</div></foreignObject>
<rect x="84" y="760" width="730" height="1" fill="#e5e7eb"/><text x="84" y="815" font-family="Arial, sans-serif" font-size="24" fill="#111827">① 개념의 적용 범위를 과도하게 확장한 설명</text><text x="84" y="870" font-family="Arial, sans-serif" font-size="24" fill="#111827">② 원인과 결과의 관계를 뒤바꾼 설명</text><text x="84" y="925" font-family="Arial, sans-serif" font-size="24" fill="#111827">③ 보기의 조건을 충실히 반영한 설명</text><text x="84" y="980" font-family="Arial, sans-serif" font-size="24" fill="#111827">④ 지문에 없는 배경지식을 단정한 설명</text><text x="84" y="1035" font-family="Arial, sans-serif" font-size="24" fill="#111827">⑤ 핵심 판단 기준을 일부 누락한 설명</text></svg>`;
}

function makeImagePaths(target: "exam" | "company") {
  return [1, 2, 3].map((page) => `/api/mock-image?target=${target}&page=${page}`);
}

function highlights(caseNo: number): Highlight[] {
  const variants: Highlight[][] = [
    [{ id: "h1", type: "box", color: "red", x: 9, y: 18, width: 72, height: 24, label: "직접 연계" }, { id: "h2", type: "underline", color: "yellow", x: 12, y: 42, width: 58, height: 6, label: "핵심 개념" }],
    [{ id: "h3", type: "box", color: "blue", x: 10, y: 62, width: 70, height: 15, label: "문항 구조" }, { id: "h4", type: "check", color: "green", x: 68, y: 74, width: 8, height: 8, label: "판단 기준" }],
    [{ id: "h5", type: "note", color: "gray", x: 12, y: 28, width: 26, height: 10, label: "배경지식" }, { id: "h6", type: "underline", color: "yellow", x: 14, y: 50, width: 48, height: 6 }]
  ];
  return variants[caseNo % variants.length];
}

const samples = [
  ["문학 작품 직접 적중", "S", "실전 체감 적중", 94, "평가원 문학 지문과 회사 콘텐츠가 동일 작품을 다루고 있으며, 인물 관계와 갈등 구조를 사전에 학습할 수 있는 형태로 구성되어 있습니다.", "이 콘텐츠를 학습한 학생은 작품 이해 시간을 줄이고, 선지 판단에 더 많은 시간을 사용할 수 있었을 가능성이 높습니다."],
  ["독서 제재 확장 연계", "B", "확장 연계 적중", 78, "평가원 독서 지문은 특정 개념의 작동 원리와 조건 변화에 따른 결과를 묻고 있습니다. 회사 콘텐츠는 동일 키워드를 단순 소개한 것이 아니라 해당 개념의 구조와 적용 방식을 훈련하도록 설계되어 있습니다.", "학생은 낯선 지문을 처음부터 해석하기보다, 이미 학습한 개념 구조 위에 세부 정보를 얹는 방식으로 접근할 수 있습니다."],
  ["보기 적용형 문항 구조 적중", "C", "문항 구조 적중", 71, "평가원 문항과 회사 콘텐츠 문항 모두 보기의 조건을 지문 개념에 적용하여 결과를 판단하게 하는 구조입니다.", "보기 적용형 문제 풀이 절차를 사전에 훈련한 학생에게 유리합니다."],
  ["선지 함정 판단 기준 적중", "D", "선지 판단 적중", 66, "두 문항 모두 원인과 결과의 관계를 바꾸어 오답 선지를 구성하는 방식이 유사합니다.", "오답 선지의 왜곡 방식을 사전에 경험한 학생은 정답 판단의 확신을 높일 수 있습니다."],
  ["독서 배경지식 시간 단축 적중", "A", "시간 단축 적중", 86, "회사 콘텐츠는 평가원 지문을 이해하는 데 필요한 배경지식과 용어를 사전에 다루고 있습니다.", "지문을 읽는 초기 부담이 줄어들고, 독해 시간이 단축될 가능성이 높습니다."],
  ["현대시 정서·표현 방식 연계", "B", "확장 연계 적중", 75, "동일 작품은 아니지만 화자의 정서, 시적 상황, 표현 방식이 유사하여 문학 감상 기준을 사전에 훈련할 수 있습니다.", "학생은 작품을 완전히 낯설게 받아들이지 않고, 유사한 감상 틀을 적용할 수 있습니다."],
  ["고전소설 인물 관계 구조 연계", "A", "시간 단축 적중", 83, "평가원 지문과 회사 콘텐츠 모두 복잡한 인물 관계와 갈등 전개를 중심으로 구성되어 있습니다.", "고전소설에서 시간이 많이 걸리는 인물 관계 파악 부담을 줄일 수 있습니다."],
  ["동일 소재권 유사", "E", "소재권 유사", 49, "동일 분야의 소재를 다루고 있으나, 평가원이 요구한 핵심 개념과 문항 구조까지 직접 연결되지는 않습니다.", "배경지식 차원의 도움은 가능하지만 강한 적중으로 보기는 어렵습니다."]
] as const;

function buildReport(exam: ExamFile, cases: MatchCase[]): Report {
  const gradeCounts: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
  cases.forEach((item) => { gradeCounts[item.grade] += 1; });
  const weighted = cases.reduce((acc, item) => ({ sum: acc.sum + item.score * weights[item.grade], weight: acc.weight + weights[item.grade] }), { sum: 0, weight: 0 });
  return { id: `report-${exam.id}-${Date.now()}`, title: `${exam.title} 콘텐츠 적중 분석 리포트`, examId: exam.id, createdAt: new Date().toISOString(), totalScore: Math.round(weighted.sum / Math.max(weighted.weight, 1)), totalCases: cases.length, gradeCounts, cases };
}

async function generateMatches(exam: ExamFile): Promise<MatchCase[]> {
  const company = await readJson<ContentFile[]>("companyContents", []);
  return samples.map(([title, grade, hitType, similarity, aiSummary, studentBenefit], index) => {
    const typedGrade = grade as Grade;
    const content = company[index % Math.max(company.length, 1)];
    return {
      id: `match-${exam.id}-${index + 1}-${Date.now()}`,
      caseNo: index + 1,
      title,
      examId: exam.id,
      companyContentId: content?.id ?? "sample-company-content",
      examLabel: exam.title,
      companyLabel: content?.title ?? "샘플 회사 콘텐츠",
      examImageUrl: exam.imagePaths[index % exam.imagePaths.length],
      companyImageUrl: content?.imagePaths[index % content.imagePaths.length] ?? makeImagePaths("company")[index % 3],
      examQuestionNo: `${18 + index}번`,
      companyQuestionNo: `${index + 1}회 ${10 + index}번`,
      grade: typedGrade,
      score: scores[typedGrade],
      similarity,
      hitType,
      hitTypeDescription: descriptions[typedGrade],
      aiSummary,
      evidencePoints: ["지문 핵심 정보의 관계를 판단하는 방식이 연결됩니다.", "문항 풀이 과정에서 적용해야 하는 기준이 유사합니다.", "사전 학습 시 시험장에서의 낯섦을 줄일 수 있습니다."],
      studentBenefit,
      caution,
      examHighlights: highlights(index + 1),
      companyHighlights: highlights(index + 2),
      approved: index < 6
    };
  });
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/api/, "") || "/";

  if (pathname === "/health") return json({ ok: true, service: "국어 콘텐츠 적중 맵" });
  if (pathname === "/mock-image") {
    return new Response(mockImage((url.searchParams.get("target") as "exam" | "company") || "exam", url.searchParams.get("page") || "1"), {
      headers: { "Content-Type": "image/svg+xml" }
    });
  }
  if (req.method === "GET" && pathname === "/company") return json(await readJson<ContentFile[]>("companyContents", []));
  if (req.method === "GET" && pathname === "/exams") return json(await readJson<ExamFile[]>("examContents", []));
  if (req.method === "GET" && pathname === "/reports") {
    const reports = await readJson<Report[]>("reports", []);
    return json(reports.map(({ cases, ...report }) => ({ ...report, totalCases: cases.length })));
  }
  if (req.method === "GET" && pathname.startsWith("/reports/")) {
    const reportId = pathname.split("/")[2];
    const reports = await readJson<Report[]>("reports", []);
    const report = reports.find((item) => item.id === reportId);
    return report ? json(report) : json({ message: "리포트를 찾을 수 없습니다." }, { status: 404 });
  }
  if (req.method === "POST" && pathname === "/company/upload") {
    const form = await req.formData();
    const files = form.getAll("files").filter((item): item is File => item instanceof File);
    const created = files.map((file, index) => ({
      id: `company-${Date.now()}-${index}`,
      title: String(form.get("title") || file.name.replace(/\.pdf$/i, "")),
      type: String(form.get("type") || "etc"),
      area: String(form.get("area") || "etc"),
      round: String(form.get("round") || ""),
      publishMonth: String(form.get("publishMonth") || ""),
      description: String(form.get("description") || ""),
      fileName: file.name,
      originalPdfPath: `netlify-uploads/company/${file.name}`,
      imagePaths: makeImagePaths("company"),
      createdAt: new Date().toISOString()
    }));
    const existing = await readJson<ContentFile[]>("companyContents", []);
    await writeJson("companyContents", [...created, ...existing]);
    return json(created.length === 1 ? created[0] : created);
  }
  if (req.method === "POST" && pathname === "/exam/upload") {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ message: "PDF 파일이 필요합니다." }, { status: 400 });
    const item: ExamFile = { id: `exam-${Date.now()}`, title: String(form.get("title") || "6월 평가원 국어"), examDate: String(form.get("examDate") || ""), fileName: file.name, originalPdfPath: `netlify-uploads/exam/${file.name}`, imagePaths: makeImagePaths("exam"), createdAt: new Date().toISOString() };
    const existing = await readJson<ExamFile[]>("examContents", []);
    await writeJson("examContents", [item, ...existing]);
    return json(item);
  }
  if (req.method === "POST" && /^\/exam\/[^/]+\/analyze$/.test(pathname)) {
    const examId = pathname.split("/")[2];
    const exams = await readJson<ExamFile[]>("examContents", []);
    const exam = exams.find((item) => item.id === examId);
    if (!exam) return json({ message: "평가원 PDF를 찾을 수 없습니다." }, { status: 404 });
    const report = buildReport(exam, await generateMatches(exam));
    const reports = await readJson<Report[]>("reports", []);
    await writeJson("reports", [report, ...reports]);
    return json(report);
  }
  if (req.method === "PATCH" && pathname.startsWith("/matches/")) {
    const matchId = pathname.split("/")[2];
    const body = await req.json();
    const reports = await readJson<Report[]>("reports", []);
    let updated: MatchCase | null = null;
    const next = reports.map((report) => {
      let changed = false;
      const cases = report.cases.map((item) => {
        if (item.id !== matchId) return item;
        changed = true;
        const grade = (body.grade ?? item.grade) as Grade;
        updated = { ...item, grade, score: scores[grade], approved: typeof body.approved === "boolean" ? body.approved : item.approved, aiSummary: body.aiSummary ?? item.aiSummary, studentBenefit: body.studentBenefit ?? item.studentBenefit };
        return updated;
      });
      return changed ? buildReport({ id: report.examId, title: report.title.replace(" 콘텐츠 적중 분석 리포트", ""), examDate: "", fileName: "", originalPdfPath: "", imagePaths: makeImagePaths("exam"), createdAt: report.createdAt }, cases) : report;
    });
    if (!updated) return json({ message: "매칭 케이스를 찾을 수 없습니다." }, { status: 404 });
    await writeJson("reports", next);
    return json(updated);
  }
  return json({ message: "Not found" }, { status: 404 });
};

export const config: Config = {
  path: "/api/*"
};
