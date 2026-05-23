import express from "express";
import cors from "cors";
import path from "node:path";
import uploadRoutes from "./routes/uploadRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { createMockPageImages } from "./services/pdfService.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/generated", express.static(path.resolve(process.cwd(), "generated")));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "국어 콘텐츠 적중 맵" }));
app.use("/api", uploadRoutes);
app.use("/api", contentRoutes);
app.use("/api", reportRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
});

await createMockPageImages("company", "sample");
await createMockPageImages("exam", "sample");

app.listen(port, () => {
  console.log(`Korean hit map server running on http://localhost:${port}`);
});
