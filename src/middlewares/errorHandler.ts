import { Request, Response, NextFunction } from "express";
import { createError } from "http-errors-enhanced";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(createError(404, `Not Found: ${req.originalUrl}`));
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  res.json({
    status: "error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};
