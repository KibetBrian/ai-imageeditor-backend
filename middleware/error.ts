//Generate express typescript error middlware

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import logger from "../utils/logger";

export interface ErrorPayload {
    message: string;
    error: Error;
    functionName: string;
}

// eslint-disable-next-line max-params
export const errorMiddleware = (error: ErrorPayload, req: Request, res: Response, next: NextFunction) => {
  logger.error(error);

  if (error.error instanceof multer.MulterError){
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Invalid file'
    });
  } else {
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
  }

  next();
};