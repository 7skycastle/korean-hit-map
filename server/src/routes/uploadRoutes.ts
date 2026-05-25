import { Router } from "express";
import multer from "multer";
import { promises as fs } from "node:fs";
import path from "node:path";
import { renderPdfToImages, saveUploadedPdf } from "../services/pdfService.js";
import { readJson, writeJson } from "../services/store.js";
import type { ContentFile, ExamFile } from "../services/types.js";

const router = Router();
const tempDir = path.resolve(process.cwd(), "uploads", "tmp");
await fs.mkdir(tempDir, { recursive: true });
const upload = multer({ dest: tempDir });

router.post("/company/upload", upload.array("files"), async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const existing = await readJson<ContentFile[]>("companyContents.json", []);
    const created: ContentFile[] = [];

    for (const file of files) {
      const originalPdfPath = await saveUploadedPdf(file, "company");
      const imagePaths = await renderPdfToImages(originalPdfPath, "company");
      const cleanTitle = file.originalname.replace(/\.pdf$/i, "");
      const description = String(req.body.description || "").trim().slice(0, 10);
      const item: ContentFile = {
        id: `company-${Date.now()}-${created.length}`,
        title: cleanTitle,
        type: "etc",
        area: "etc",
        round: "",
        publishMonth: "",
        description,
        fileName: file.originalname,
        originalPdfPath,
        imagePaths,
        createdAt: new Date().toISOString()
      };
      created.push(item);
    }

    await writeJson("companyContents.json", [...created, ...existing]);
    res.json(created.length === 1 ? created[0] : created);
  } catch (error) {
    next(error);
  }
});

router.post("/exam/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "PDF 파일이 필요합니다." });
      return;
    }
    const originalPdfPath = await saveUploadedPdf(req.file, "exam");
    const imagePaths = await renderPdfToImages(originalPdfPath, "exam");
    const item: ExamFile = {
      id: `exam-${Date.now()}`,
      title: String(req.body.title || "6월 평가원 국어"),
      examDate: String(req.body.examDate || ""),
      fileName: req.file.originalname,
      originalPdfPath,
      imagePaths,
      createdAt: new Date().toISOString()
    };
    const existing = await readJson<ExamFile[]>("examContents.json", []);
    await writeJson("examContents.json", [item, ...existing]);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

export default router;
