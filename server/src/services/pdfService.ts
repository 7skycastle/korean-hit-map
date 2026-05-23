import { promises as fs } from "node:fs";
import path from "node:path";
import type { Express } from "express";
import { publicPath } from "./store.js";

type TargetType = "company" | "exam";

const rootDir = process.cwd();

function safeName(name: string): string {
  return name.replace(/[^\w.\-가-힣]/g, "_");
}

export async function saveUploadedPdf(file: Express.Multer.File, targetType: TargetType): Promise<string> {
  const uploadDir = path.join(rootDir, "uploads", targetType);
  await fs.mkdir(uploadDir, { recursive: true });
  const storedName = `${Date.now()}-${safeName(file.originalname)}`;
  const targetPath = path.join(uploadDir, storedName);
  await fs.rename(file.path, targetPath);
  return targetPath;
}

export async function renderPdfToImages(pdfPath: string, targetType: TargetType = "company"): Promise<string[]> {
  return createMockPageImages(targetType, path.basename(pdfPath, path.extname(pdfPath)));
}

export async function createMockPageImages(targetType: TargetType, seed = "sample"): Promise<string[]> {
  const imageDir = path.join(rootDir, "generated", "images", targetType);
  await fs.mkdir(imageDir, { recursive: true });

  const pages = [1, 2, 3].map(async (page) => {
    const fileName = seed === "sample" ? `sample-p${page}.svg` : `${Date.now()}-${safeName(seed)}-p${page}.svg`;
    const filePath = path.join(imageDir, fileName);
    const title = targetType === "exam" ? "6월 평가원 국어" : "회사 콘텐츠";
    const accent = targetType === "exam" ? "#1d4ed8" : "#991b1b";
    const body = page % 2 === 0 ? "보기 조건을 지문 개념에 적용하여 결과를 판단하는 문항 구조입니다." : "작품의 갈등 구조와 핵심 개념을 사전에 학습할 수 있는 지문입니다.";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <rect width="900" height="1200" fill="#ffffff"/>
  <rect x="54" y="42" width="792" height="1116" fill="#fff" stroke="#d6dae3" stroke-width="2"/>
  <text x="84" y="105" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${accent}">${title}</text>
  <text x="730" y="105" font-family="Arial, sans-serif" font-size="22" fill="#667085">page ${page}</text>
  <line x1="84" y1="132" x2="816" y2="132" stroke="#d6dae3" stroke-width="2"/>
  <text x="84" y="190" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="#111827">[${page + 14}~${page + 16}] 다음 글을 읽고 물음에 답하시오.</text>
  <foreignObject x="84" y="232" width="730" height="480">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 25px; line-height: 1.85; color: #273142;">
      ${body} 평가원 문항은 표면적인 키워드보다 정보의 관계, 조건 변화, 판단 기준을 묻는다. 이 페이지는 실제 PDF 캡처를 대체하는 프로토타입 이미지이며, 하이라이트 오버레이 검증을 위해 문단과 문항 형태를 포함한다.
    </div>
  </foreignObject>
  <rect x="84" y="760" width="730" height="1" fill="#e5e7eb"/>
  <text x="84" y="815" font-family="Arial, sans-serif" font-size="24" fill="#111827">① 개념의 적용 범위를 과도하게 확장한 설명</text>
  <text x="84" y="870" font-family="Arial, sans-serif" font-size="24" fill="#111827">② 원인과 결과의 관계를 뒤바꾼 설명</text>
  <text x="84" y="925" font-family="Arial, sans-serif" font-size="24" fill="#111827">③ 보기의 조건을 충실히 반영한 설명</text>
  <text x="84" y="980" font-family="Arial, sans-serif" font-size="24" fill="#111827">④ 지문에 없는 배경지식을 단정한 설명</text>
  <text x="84" y="1035" font-family="Arial, sans-serif" font-size="24" fill="#111827">⑤ 핵심 판단 기준을 일부 누락한 설명</text>
</svg>`;
    await fs.writeFile(filePath, svg, "utf-8");
    return publicPath(filePath);
  });

  return Promise.all(pages);
}
