import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import {
  listDocuments as getDocuments,
  vectorSearch,
} from "../data/vectorStore.js";

export const listDocuments = catchAsync(async (_req, res) => {
  const documents = getDocuments();
  res.status(200).json({
    status: "success",
    count: documents.length,
    documents,
  });
});

/**
 * HTTP QUERY — complex AI read with a JSON body.
 * Not GET (filters/semantic body) and not POST (this is a fetch, not a write).
 */
export const search = catchAsync(async (req, res, next) => {
  if (req.method !== "QUERY") {
    return next(
      new AppError("Method Not Allowed. Use QUERY with a JSON body.", 405),
    );
  }

  const results = vectorSearch(req.body || {});

  res.status(200).json({
    status: "success",
    method: "QUERY",
    query: req.body,
    returned: results.length,
    results,
  });
});
