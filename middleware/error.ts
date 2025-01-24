import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import logger from "../utils/logger";

export interface ErrorPayload {
    message: string;
    error: Error;
    functionName: string;
}

export const errorMiddleware = (
  error: ErrorPayload | Error, 
  req: Request, 
  res: Response, 
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  next: NextFunction
// eslint-disable-next-line max-params
) => {
  // Log the full error details
  logger.error({
    message: error instanceof Error ? error.message : error.message,
    stack: error instanceof Error ? error.stack : error.error.stack,
    functionName: error instanceof Error ? 'unknown' : error.functionName,
    path: req.path,
    method: req.method
  });

  if (error instanceof multer.MulterError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'File upload error',
      error: error.message
    });
  }

  if (error instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};