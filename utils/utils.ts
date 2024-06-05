import { NextFunction } from "express";
import { ErrorPayload } from "../middleware/error";

interface HandleError extends ErrorPayload {
  next: NextFunction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

export const handleError = (input: HandleError) => {
  const { next, message, error, functionName } = input;

  next({ message, error, functionName });
};