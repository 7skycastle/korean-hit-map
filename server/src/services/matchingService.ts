import { readJson } from "./store.js";
import type { ContentFile, ExamFile, Grade, Highlight, MatchCase } from "./types.js";
import { scoreForGrade } from "./reportService.js";

const caution =
  "본 분석은 동일 문항 출제를 의미하지 않습니다. 학생이 시험장에서 체감할 수 있는 연계 요소와 학습 효과를 분석한 자료입니다.";

const ruleTypes = [
  { title: "문학 작품 직접 적중", grade: "S" as Grade, hitType: "실전 체감 적중", similarity: 94 },
  { title: "독서 배경지식 시간 단축 적중", grade: "A" as Grade, hitType: "시간 단축 적중", similarity: 86 },
  { title: "독서 제재 확장 연계", grade: "B" as Grade, hitType: "확장 연계 적중", similarity: 78 },
  { title: "보기 적용형 문항 구조 적중", grade: "C" as Grade, hitType: "문항 구조 적중", similarity: 71 },
  { title: "선지 함정 판단 기준 적중", grade: "D" as Grade, hitType: "선지 판단 적중", similarity: 66 },
  { title: "동일 소재권 유사", grade: "E" as Grade, hitType: "소재권 유사", similarity: 49 }
];

function excerpt(markdown = "", maxLength = 650): string {
  const cleaned = markdown.replace(/\n{3,}/g, "\n\n").trim();
  if (!cleaned) return "Markdown 변환 텍스트가 없습니다.";
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}...` : cleaned;
}

function findQuestionLabel(markdown = "", fallback: string): string {
  const patterns = [/\b(\d{1,2}\s*~\s*\d{1,2}\s*번)\b/, /\b(\d{1,2}\s*번)\b/, /\[(\d{1,2}\s*~\s*\d{1,2})\]/];
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match?.[1]) return match[1].replace(/\s+/g, " ");
  }
  return fallback;
}

function tokenize(text = ""): string[] {
  return (text.match(/[가-힣A-Za-z0-9]{2,}/g) || []).map((token) => token.toLowerCase());
}

function sharedKeywords(a = "", b = "", max = 6): string[] {
  const aSet = new Set(tokenize(a));
  const bSet = new Set(tokenize(b));
  const stop = new Set([
    "문항",
    "분석",
    "텍스트",
    "비교",
    "기준",
    "회사",
    "콘텐츠",
    "평가원",
    "markdown",
    "pdf",
    "기반",
    "규칙"
  ]);
  return [...aSet].filter((token) => bSet.has(token) && !stop.has(token)).slice(0, max);
}

function findEvidenceSentence(markdown = "", keywords: string[]): string {
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

function makeHighlights(): Highlight[] {
  return [];
}

function buildSimilarityReason(ruleTitle: string, examQuestionNo: string, companyQuestionNo: string, keywordText: string): string {
  return `${ruleTitle} 기준으로 평가원 ${examQuestionNo}와 회사 콘텐츠 ${companyQuestionNo}를 비교했습니다. 공통 키워드(${keywordText})와 문장 근거를 통해 연결 가능성을 도출했습니다.`;
}

function toMarkdownComparison(reason: string, examEvidence: string, companyEvidence: string): string {
  return [reason, `평가원 근거: ${examEvidence}`, `회사 콘텐츠 근거: ${companyEvidence}`].join("\n");
}

export async function generateMockMatches(examId: string): Promise<MatchCase[]> {
  const exams = await readJson<ExamFile[]>("examContents.json", []);
  const company = await readJson<ContentFile[]>("companyContents.json", []);
  const exam = exams.find((item) => item.id === examId);
  const candidates = company.length ? company : [];

  return ruleTypes.map((rule, index) => {
    const content = candidates[index % Math.max(candidates.length, 1)];
    const grade = rule.grade;
    const examMarkdown = exam?.markdownContent || "";
    const companyMarkdown = content?.markdownContent || "";
    const keywords = sharedKeywords(examMarkdown, companyMarkdown);
    const keywordText = keywords.length ? keywords.join(", ") : "공통 핵심어 부족";
    const examEvidence = findEvidenceSentence(examMarkdown, keywords);
    const companyEvidence = findEvidenceSentence(companyMarkdown, keywords);
    const examQuestionNo = findQuestionLabel(examMarkdown, `${18 + index}번`);
    const companyQuestionNo = findQuestionLabel(companyMarkdown, `${index + 1}번 후보`);
    const questionPairSummary = `평가원 ${examQuestionNo} ↔ 회사 ${companyQuestionNo}`;
    const similarityReason = buildSimilarityReason(rule.title, examQuestionNo, companyQuestionNo, keywordText);

    return {
      id: `match-${examId}-${index + 1}-${Date.now()}`,
      caseNo: index + 1,
      title: rule.title,
      examId,
      companyContentId: content?.id ?? "no-company-content",
      examLabel: exam?.title ?? "평가원 국어",
      companyLabel: content?.title ?? "등록된 회사 콘텐츠 없음",
      examImageUrl: "",
      companyImageUrl: "",
      examMarkdownExcerpt: excerpt(examMarkdown),
      companyMarkdownExcerpt: excerpt(companyMarkdown),
      markdownComparison: toMarkdownComparison(similarityReason, examEvidence, companyEvidence),
      examQuestionNo,
      companyQuestionNo,
      grade,
      score: scoreForGrade(grade),
      similarity: rule.similarity,
      hitType: rule.hitType,
      hitTypeDescription: rule.title,
      aiSummary: similarityReason,
      questionPairSummary,
      similarityReason,
      sharedKeywords: keywords,
      examEvidence,
      companyEvidence,
      evidencePoints: [
        `비교 문항: ${questionPairSummary}`,
        `공통 키워드: ${keywordText}`,
        `평가원 근거 문장: ${examEvidence}`,
        `회사 근거 문장: ${companyEvidence}`
      ],
      studentBenefit:
        "학생은 익숙한 개념 구조를 먼저 불러와 지문 진입 시간을 줄이고, 문항 판단 기준을 더 빠르게 적용할 가능성이 높습니다.",
      caution,
      examHighlights: makeHighlights(),
      companyHighlights: makeHighlights(),
      approved: index < 5
    };
  });
}
