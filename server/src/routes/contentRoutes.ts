import { Router } from "express";
import { generateMockMatches } from "../services/matchingService.js";
import { buildReport } from "../services/reportService.js";
import { readJson, writeJson } from "../services/store.js";
import type { ContentFile, ExamFile, Report } from "../services/types.js";

const router = Router();

router.get("/company", async (_req, res, next) => {
  try {
    res.json(await readJson<ContentFile[]>("companyContents.json", []));
  } catch (error) {
    next(error);
  }
});

router.delete("/company/:contentId", async (req, res, next) => {
  try {
    const existing = await readJson<ContentFile[]>("companyContents.json", []);
    const nextItems = existing.filter((item) => item.id !== req.params.contentId);
    if (nextItems.length === existing.length) {
      res.status(404).json({ message: "콘텐츠를 찾을 수 없습니다." });
      return;
    }
    await writeJson("companyContents.json", nextItems);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get("/exams", async (_req, res, next) => {
  try {
    res.json(await readJson<ExamFile[]>("examContents.json", []));
  } catch (error) {
    next(error);
  }
});

router.post("/exam/:examId/analyze", async (req, res, next) => {
  try {
    const exams = await readJson<ExamFile[]>("examContents.json", []);
    const exam = exams.find((item) => item.id === req.params.examId);
    if (!exam) {
      res.status(404).json({ message: "평가원 PDF를 찾을 수 없습니다." });
      return;
    }
    const cases = await generateMockMatches(req.params.examId);
    const report = buildReport(exam.id, exam.title, cases);
    const reports = await readJson<Report[]>("reports.json", []);
    await writeJson("reports.json", [report, ...reports]);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

export default router;
