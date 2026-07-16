import AppError from "../utils/appError.js";

export default function globalErrorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const status =
    err.status || (String(statusCode).startsWith("4") ? "fail" : "error");

  if (!(err instanceof AppError) && !err.isOperational) {
    console.error("ERROR", err);
  }

  if (statusCode === 405) {
    return res.status(405).json({
      status: "fail",
      code: 405,
      message: err.message,
      allowed: ["QUERY"],
      hint: "In Postman type method QUERY and send a JSON body",
    });
  }

  if (statusCode === 414) {
    return res.status(414).json({
      status: "fail",
      code: 414,
      message: err.message,
      hint: "Use QUERY http://localhost:3001/api/products/query with a JSON body (see examples/query-body.json)",
    });
  }

  res.status(statusCode).json({
    status,
    code: statusCode,
    message: err.message || "Something went wrong",
  });
}
