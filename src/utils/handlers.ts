import { Request, Response } from "express";

export const apiStatusHandler = (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "OK",
    timestamp: new Date().toISOString(),
    IP: req.ip,
    URL: req.originalUrl,
  });
};
