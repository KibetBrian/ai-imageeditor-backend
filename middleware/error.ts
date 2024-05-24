//Generate express typescript error middlware

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

// eslint-disable-next-line max-params
export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: error.message
  });

  next();
};