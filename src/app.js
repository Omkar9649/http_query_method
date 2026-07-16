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
    name: "http-query-method",
    rfc: "https://www.rfc-editor.org/rfc/rfc10008.html",
    story: {
      GET: "Can fetch, but filters go in the URL — limited for large/complex data",
      POST: "Can fetch with a JSON body, but POST is unsafe/write-like and not cacheable as a read",
      QUERY: "Safe read with a JSON body — fixes both GET and POST limitations",
    },
    endpoints: {
      "GET /api/products": "Fetch (optional simple URL filters; long URL → 414)",
      "POST /api/products/search": "Fetch with JSON body (bumps postSideEffects; Cache-Control: no-store)",
      "QUERY /api/products/query": "Fetch with JSON body (safe read; does not bump postSideEffects)",
    },
  });
});

app.use("/api", apiRouter);

app.use((req, _res, next) => {
  next(new AppError(`Not found: ${req.method} ${req.path}`, 404));
});

app.use(globalErrorHandler);

export default app;
