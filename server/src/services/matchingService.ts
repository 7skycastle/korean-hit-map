import { readJson } from "./store.js";
import type { ContentFile, ExamFile, Grade, Highlight, MatchCase } from "./types.js";
import { scoreForGrade } from "./reportService.js";

const caution = "이 분석은 동일 문항 출제를 의미하지 않으며, Markdown으로 변환된 텍스트에서 체감 가능한 연계 요소를 요약한 것입니다.";

const ruleTypes = [
  { title: "동일 작품·제재 직접 연계", grade: "S" as Grade, hitType: "실전 체감 적중", similarity: 94 },
  { title: "핵심 개념 선학습 연계", grade: "A" as Grade, hitType: "시간 단축 적중", similarity: 86 },
  { title: "논점·구조 확장 연계", grade: "B" as Grade, hitType: "확장 연계 적중", similarity: 78 },
  { title: "보기 적용형 문항 구조 연계", grade: "C" as Grade, hitType: "문항 구조 적중", similarity: 71 },
  { title: "선지 판단 기준·함정 연계", grade: "D" as Grade, hitType: "선지 판단 적중", similarity: 66 },
  { title: "소재권·배경지식 유사", grade: "E" as Grade, hitType: "소재권 유사", similarity: 49 }
];

function excerpt(markdown = "", maxLength = 650): string {
  const cleaned = markdown.replace(/^# .+$/m, "").replace(/\n{3,}/g, "\n\n").trim();
  if (!cleaned) return "Markdown 변환 결과에서 비교 가능한 텍스트가 충분히 추출되지 않았습니다.";
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}...` : cleaned;
}

function makeHighlights(): Highlight[] {
  return [];
}

function compareSummary(ruleTitle: string, exam: ExamFile | undefined, content: ContentFile | undefined): string {
  return [
    `평가원 Markdown(${exam?.title ?? "평가원 국어"})과 회사 콘텐츠 Markdown(${content?.title ?? "회사 콘텐츠"})을 규칙 기반으로 비교했습니다.`,
    `${ruleTitle} 관점에서 작품·제재, 핵심 개념, 문항 구조, 선지 판단 기준의 연결 가능성을 요약합니다.`,
    "현재 프로토타입은 OCR/LLM 대신 추출 텍스트와 파일 메타데이터를 사용한 mock 분석이며, 이후 LLM 근거 생성으로 교체할 수 있습니다."
  ].join(" ");
}

export async function generateMockMatches(examId: string): Promise<MatchCase[]> {
  const exams = await readJson<ExamFile[]>("examContents.json", []);
  const company = await readJson<ContentFile[]>("companyContents.json", []);
  const exam = exams.find((item) => item.id === examId);
  const candidates = company.length ? company : [];

  return ruleTypes.map((rule, index) => {
    const content = candidates[index % Math.max(candidates.length, 1)];
    const grade = rule.grade;
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
      examMarkdownExcerpt: excerpt(exam?.markdownContent),
      companyMarkdownExcerpt: excerpt(content?.markdownContent),
      markdownComparison: compareSummary(rule.title, exam, content),
      examQuestionNo: `${18 + index}번`,
      companyQuestionNo: `${index + 1}번 후보`,
      grade,
      score: scoreForGrade(grade),
      similarity: rule.similarity,
      hitType: rule.hitType,
      hitTypeDescription: rule.title,
      aiSummary: compareSummary(rule.title, exam, content),
      evidencePoints: [
        "PDF를 Markdown으로 변환한 텍스트를 기준으로 비교했습니다.",
        "작품·제재·핵심 개념·문항 구조·선지 판단 기준을 규칙별로 분리했습니다.",
        "승인된 케이스만 최종 리포트에 포함됩니다."
      ],
      studentBenefit: "학생이 사전에 접한 콘텐츠가 시험장에서 지문 이해, 보기 적용, 선지 판단에 도움을 줄 수 있는지를 빠르게 검토할 수 있습니다.",
      caution,
      examHighlights: makeHighlights(),
      companyHighlights: makeHighlights(),
      approved: index < 5
    };
  });
}
