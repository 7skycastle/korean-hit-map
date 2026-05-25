import { promises as fs } from "node:fs";
import path from "node:path";
import type { Express } from "express";
import pdfParse from "pdf-parse";
import { publicPath } from "./store.js";

type TargetType = "company" | "exam";

const rootDir = process.cwd();

function safeName(name: string): string {
  return name.replace(/[^\w.\-\u3131-\uD79D]/g, "_");
}

function wrapText(text: string, maxChars = 42): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if (`${current} ${word}`.length <= maxChars) {
      current += ` ${word}`;
      continue;
    }
    lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines.slice(0, 34);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function extractPdfText(pdfPath: string): Promise<string> {
  const buffer = await fs.readFile(pdfPath);
  const parsed = await pdfParse(buffer);
  return parsed.text || "";
}

function buildPreviewSvg(targetType: TargetType, title: string, page: number, bodyText: string): string {
  const accent = targetType === "exam" ? "#1d4ed8" : "#991b1b";
  const lines = wrapText(bodyText);
  const lineHeight = 31;
  const textBlocks = lines
    .map((line, index) => `<text x="92" y="${292 + index * lineHeight}" font-family="Arial, sans-serif" font-size="24" fill="#1f2937">${escapeXml(line)}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <rect width="900" height="1200" fill="#ffffff"/>
  <rect x="54" y="42" width="792" height="1116" fill="#fff" stroke="#d6dae3" stroke-width="2"/>
  <text x="84" y="105" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${accent}">${escapeXml(title)}</text>
  <text x="730" y="105" font-family="Arial, sans-serif" font-size="22" fill="#667085">page ${page}</text>
  <line x1="84" y1="132" x2="816" y2="132" stroke="#d6dae3" stroke-width="2"/>
  <text x="84" y="190" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="#111827">PDF 실제 텍스트 미리보기</text>
  <line x1="84" y1="220" x2="816" y2="220" stroke="#e5e7eb" stroke-width="2"/>
  ${textBlocks}
</svg>`;
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
  try {
    const text = await extractPdfText(pdfPath);
    return createPreviewImagesFromText(targetType, path.basename(pdfPath, path.extname(pdfPath)), text);
  } catch {
    return createMockPageImages(targetType, path.basename(pdfPath, path.extname(pdfPath)));
  }
}

async function createPreviewImagesFromText(targetType: TargetType, seed: string, text: string): Promise<string[]> {
  const imageDir = path.join(rootDir, "generated", "images", targetType);
  await fs.mkdir(imageDir, { recursive: true });
  const pages = [1, 2, 3].map(async (page) => {
    const fileName = `${Date.now()}-${safeName(seed)}-p${page}.svg`;
    const filePath = path.join(imageDir, fileName);
    const svg = buildPreviewSvg(targetType, seed, page, text || "PDF에서 텍스트를 추출하지 못했습니다.");
    await fs.writeFile(filePath, svg, "utf-8");
    return publicPath(filePath);
  });
  return Promise.all(pages);
}

export async function createMockPageImages(targetType: TargetType, seed = "sample"): Promise<string[]> {
  const imageDir = path.join(rootDir, "generated", "images", targetType);
  await fs.mkdir(imageDir, { recursive: true });
  const pages = [1, 2, 3].map(async (page) => {
    const fileName = seed === "sample" ? `sample-p${page}.svg` : `${Date.now()}-${safeName(seed)}-p${page}.svg`;
    const filePath = path.join(imageDir, fileName);
    const title = targetType === "exam" ? "6월 평가원 국어" : "회사 콘텐츠";
    const svg = buildPreviewSvg(
      targetType,
      title,
      page,
      "실제 PDF 텍스트 추출 실패로 기본 미리보기를 표시합니다. 추후 OCR 또는 페이지 렌더링 엔진 연동으로 이미지 정확도를 개선할 수 있습니다."
    );
    await fs.writeFile(filePath, svg, "utf-8");
    return publicPath(filePath);
  });
  return Promise.all(pages);
}
