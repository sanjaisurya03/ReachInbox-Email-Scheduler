import { Request, Response, NextFunction } from "express";
import { searchEmails } from "../services/elasticsearch.service.js";

export async function searchEmailController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query =
      typeof req.query.q === "string"
        ? req.query.q
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const emails = await searchEmails(query, status);

    return res.status(200).json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error) {
    next(error);
  }
}