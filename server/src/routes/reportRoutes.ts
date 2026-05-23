import { Router } from "express";
import { buildReport, scoreForGrade } from "../services/reportService.js";
import { readJson, writeJson } from "../services/store.js";
import type { Grade, Report } from "../services/types.js";

const router = Router();

router.get("/reports", async (_req, res, next) => {
  try {
    const reports = await readJson<Report[]>("reports.json", []);
    res.json(reports.map(({ cases, ...report }) => ({ ...report, totalCases: cases.length })));
  } catch (error) {
    next(error);
  }
});

router.get("/reports/:reportId", async (req, res, next) => {
  try {
    const reports = await readJson<Report[]>("reports.json", []);
    const report = reports.find((item) => item.id === req.params.reportId);
    if (!report) {
      res.status(404).json({ message: "리포트를 찾을 수 없습니다." });
      return;
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.patch("/matches/:matchId", async (req, res, next) => {
  try {
    const reports = await readJson<Report[]>("reports.json", []);
    let updatedMatch = null;
    const nextReports = reports.map((report) => {
      const cases = report.cases.map((item) => {
        if (item.id !== req.params.matchId) return item;
        const grade = (req.body.grade ?? item.grade) as Grade;
        updatedMatch = {
          ...item,
          grade,
          score: scoreForGrade(grade),
          approved: typeof req.body.approved === "boolean" ? req.body.approved : item.approved,
          aiSummary: req.body.aiSummary ?? item.aiSummary,
          studentBenefit: req.body.studentBenefit ?? item.studentBenefit
        };
        return updatedMatch;
      });
      return cases.some((item) => item.id === req.params.matchId) ? buildReport(report.examId, report.title.replace(" 콘텐츠 적중 분석 리포트", ""), cases) : report;
    });

    if (!updatedMatch) {
      res.status(404).json({ message: "매칭 케이스를 찾을 수 없습니다." });
      return;
    }
    await writeJson("reports.json", nextReports);
    res.json(updatedMatch);
  } catch (error) {
    next(error);
  }
});

export default router;
