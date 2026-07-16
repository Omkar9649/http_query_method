import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { listProducts, queryProducts } from "../data/db.js";

/** Max query-string length for GET (after ?). Longer → 414 URI Too Long. */
export const MAX_GET_QUERY_LENGTH = 500;

/**
 * Counts POST /search calls to show POST is treated as unsafe/write-like.
 * QUERY never increments this.
 */
let postSideEffects = 0;

export function getPostSideEffects() {
  return postSideEffects;
}

/** Parse GET query-string filters (flat params only). */
function filtersFromQuery(q = {}) {
  const filters = {};

  if (q.category != null && q.category !== "") {
    filters.category = String(q.category);
  }
  if (q.inStock != null && q.inStock !== "") {
    filters.inStock = String(q.inStock).toLowerCase() === "true";
  }
  if (q.minPrice != null && q.minPrice !== "") {
    filters.minPrice = Number(q.minPrice);
  }
  if (q.maxPrice != null && q.maxPrice !== "") {
    filters.maxPrice = Number(q.maxPrice);
  }
  // Arrays in a URL are awkward — one tag only via query string
  if (q.tag != null && q.tag !== "") {
    filters.tags = [String(q.tag)];
  }

  return filters;
}

function queryStringLength(req) {
  const url = req.originalUrl || req.url || "";
  const i = url.indexOf("?");
  return i === -1 ? 0 : url.length - i - 1;
}

/**
 * GET — fetch with URL query parameters.
 * Limitation: filters live in the URL (length limits, hard arrays/nested JSON).
 */
export const getAll = catchAsync(async (req, res, next) => {
  const qsLength = queryStringLength(req);

  if (qsLength > MAX_GET_QUERY_LENGTH) {
    return next(
      new AppError(
        `URI Too Long: GET query string is ${qsLength} characters (limit ${MAX_GET_QUERY_LENGTH}). Large filters do not fit in the URL. Use QUERY /api/products/query with a JSON body instead.`,
        414,
      ),
    );
  }

  const hasFilters = Object.keys(req.query || {}).length > 0;
  const filters = filtersFromQuery(req.query);
  const products = hasFilters ? queryProducts(filters) : listProducts();

  res.status(200).json({
    status: "success",
    method: "GET",
    queryStringLength: qsLength,
    maxQueryStringLength: MAX_GET_QUERY_LENGTH,
    filters: hasFilters ? filters : null,
    count: products.length,
    products,
    limitation:
      "GET puts filters in the URL. Long or complex filters (many tags, nested objects) hit URL length limits and ugly encoding. A JSON body is not reliable for GET.",
  });
});

/**
 * POST — fetch with a JSON body (common workaround for GET).
 * Limitation: POST is a write method; using it for reads is not safe/cacheable/idempotent.
 */
export const searchWithPost = catchAsync(async (req, res) => {
  postSideEffects += 1;

  const filters = req.body || {};
  const products = queryProducts(filters);

  // Caches must not store POST responses as a normal read
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-HTTP-Safe", "false");

  res.status(200).json({
    status: "success",
    method: "POST",
    filters,
    count: products.length,
    products,
    postSideEffects,
    headersExplained: {
      "Cache-Control": "no-store — caches must not reuse this as a read",
      "X-HTTP-Safe": "false — POST is not a safe method",
    },
    limitation:
      "POST can send a JSON body, so complex filters work — but POST means 'create/change'. Each call bumps postSideEffects (unsafe / retry risk). Caches treat it as a write (Cache-Control: no-store).",
  });
});

/**
 * QUERY — fetch with a JSON body (the right read method).
 * Solves GET (no room for rich filters) and POST (wrong method for reads).
 */
export const query = catchAsync(async (req, res, next) => {
  if (req.method !== "QUERY") {
    return next(
      new AppError("Method Not Allowed. Use QUERY with a JSON body.", 405),
    );
  }

  const filters = req.body || {};
  const products = queryProducts(filters);

  // Safe read — may be cached by the client (unlike POST)
  res.setHeader("Cache-Control", "private, max-age=60");
  res.setHeader("X-HTTP-Safe", "true");

  res.status(200).json({
    status: "success",
    method: "QUERY",
    filters,
    count: products.length,
    products,
    postSideEffects,
    headersExplained: {
      "Cache-Control": "private, max-age=60 — safe reads can be cached",
      "X-HTTP-Safe": "true — QUERY is a safe read method",
    },
    note: "QUERY is a safe read with a JSON body. postSideEffects does not increase (unlike POST). No URL-length pain (unlike GET).",
  });
});
