import { readJson } from "./store.js";
import type { ContentFile, ExamFile, Grade, Highlight, MatchCase } from "./types.js";
import { scoreForGrade } from "./reportService.js";

const caution = "이 분석은 동일 문항 출제를 의미하지 않으며, 실제 시험에서 체감 가능한 연계 요소를 분석한 것입니다.";

const descriptions: Record<Grade, string> = {
  S: "동일 작품 또는 매우 유사한 지문·제재가 있어 강한 연계 체감이 가능한 경우",
  A: "사전 학습으로 지문 이해 속도가 빨라질 가능성이 높은 경우",
  B: "핵심 개념, 논점, 구조가 사전에 훈련된 경우",
  C: "발문, 보기, 추론 방식, 비교 방식이 유사한 경우",
  D: "선지를 판단하는 기준이나 함정 구조가 유사한 경우",
  E: "같은 분야나 비슷한 소재이나 직접적인 시험 도움은 제한적인 경우"
};

function highlights(caseNo: number): Highlight[] {
  const variants: Highlight[][] = [
    [
      { id: "h1", type: "box", color: "red", x: 9, y: 18, width: 72, height: 24, label: "직접 연계" },
      { id: "h2", type: "underline", color: "yellow", x: 12, y: 42, width: 58, height: 6, label: "핵심 개념" }
    ],
    [
      { id: "h3", type: "box", color: "blue", x: 10, y: 62, width: 70, height: 15, label: "문항 구조" },
      { id: "h4", type: "check", color: "green", x: 68, y: 74, width: 8, height: 8, label: "판단 기준" }
    ],
    [
      { id: "h5", type: "note", color: "gray", x: 12, y: 28, width: 26, height: 10, label: "배경지식" },
      { id: "h6", type: "underline", color: "yellow", x: 14, y: 50, width: 48, height: 6 }
    ]
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

export async function generateMockMatches(examId: string): Promise<MatchCase[]> {
  const exams = await readJson<ExamFile[]>("examContents.json", []);
  const company = await readJson<ContentFile[]>("companyContents.json", []);
  const exam = exams.find((item) => item.id === examId);
  const fallbackCompany = company[0];

  return samples.map(([title, grade, hitType, similarity, aiSummary, studentBenefit], index) => {
    const content = company[index % Math.max(company.length, 1)] ?? fallbackCompany;
    const typedGrade = grade as Grade;
    return {
      id: `match-${examId}-${index + 1}-${Date.now()}`,
      caseNo: index + 1,
      title,
      examId,
      companyContentId: content?.id ?? "sample-company-content",
      examLabel: exam?.title ?? "6월 평가원 국어",
      companyLabel: content?.title ?? "샘플 회사 콘텐츠",
      examImageUrl: exam?.imagePaths[index % Math.max(exam.imagePaths.length, 1)] ?? `/generated/images/exam/sample-p${(index % 3) + 1}.svg`,
      companyImageUrl: content?.imagePaths[index % Math.max(content.imagePaths.length, 1)] ?? `/generated/images/company/sample-p${(index % 3) + 1}.svg`,
      examQuestionNo: `${18 + index}번`,
      companyQuestionNo: `${index + 1}회 ${10 + index}번`,
      grade: typedGrade,
      score: scoreForGrade(typedGrade),
      similarity,
      hitType,
      hitTypeDescription: descriptions[typedGrade],
      aiSummary,
      evidencePoints: [
        "지문 핵심 정보의 관계를 판단하는 방식이 연결됩니다.",
        "문항 풀이 과정에서 적용해야 하는 기준이 유사합니다.",
        "사전 학습 시 시험장에서의 낯섦을 줄일 수 있습니다."
      ],
      studentBenefit,
      caution,
      examHighlights: highlights(index + 1),
      companyHighlights: highlights(index + 2),
      approved: index < 6
    };
  });
}
