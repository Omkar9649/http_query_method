import express from "express";
import helmet from "helmet";
import cors from "cors";
import AppError from "./utils/appError.js";
import globalErrorHandler from "./middleware/errorHandler.js";
import apiRouter from "./routes/index.js";

const app = express();

app.use(cors({ origin: "*" }));
app.options("*", cors());
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.use((req, res, next) => {
  res.setHeader("Accept-Query", "application/json");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.get("/", (_req, res) => {
  res.json({
    name: "http-query-ai-demo",
    rfc: "https://www.rfc-editor.org/rfc/rfc10008.html",
    whyQUERY:
      "Complex AI search needs a JSON body (filters + semantic text + topK). GET has weak body support; POST is for writes. QUERY is the safe read method for this.",
    endpoints: {
      "GET /api/ai/documents": "List dummy knowledge-base docs",
      "QUERY /api/ai/search": "Complex AI / vector search (JSON body)",
    },
  });
});

app.use("/api", apiRouter);

app.use((req, _res, next) => {
  next(new AppError(`Not found: ${req.method} ${req.path}`, 404));
});

app.use(globalErrorHandler);

export default app;
