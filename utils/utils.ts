import { NextFunction } from "express";
import { ErrorPayload } from "../middleware/error";
import { createId } from '@paralleldrive/cuid2';
import { AxiosResponse } from "axios";
import { StatusCodes } from "http-status-codes";
import logger from "./logger";

interface HandleError extends ErrorPayload {
  next: NextFunction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

export const handleError = (input: HandleError) => {
  const { next, message, error, functionName } = input;

  next({ message, error, functionName });
};

export const generateCuid = () => {
  return createId();
};

interface GetStabilityFetchAIResponse {
  response: AxiosResponse
}
export const getStabilityFetchResponse = ({ response }: GetStabilityFetchAIResponse) => {
  if (response.status===StatusCodes.OK){
    return {
      status: StatusCodes.OK,
      data: response.data,
      message: 'Success'
    };
  }

  if (response.status===StatusCodes.ACCEPTED){
    return {
      status: StatusCodes.ACCEPTED,
      data: response.data,
      message: 'Accepted'
    };
  }

  if (response.status===StatusCodes.BAD_REQUEST){
    return {
      status: StatusCodes.BAD_REQUEST,
      data: response.data.toString(),
      message: 'Bad Request'
    };
  }

  if (response.status===StatusCodes.UNAUTHORIZED){
    return {
      status: StatusCodes.UNAUTHORIZED,
      data: response.data.toString(),
      message: 'We are experiencing issues, try again later'
    };
  }

  if (response.status===StatusCodes.FORBIDDEN){
    return {
      status: StatusCodes.UNAUTHORIZED,
      data: response.data,
      message: 'Request flagged by content moderation system'
    };
  }

  if (response.status=== StatusCodes.REQUEST_TOO_LONG){
    return {
      status: StatusCodes.REQUEST_TOO_LONG,
      data: response.data,
      message: 'File uploaded larger than 10 Mbs'
    };
  }

  if (response.status===StatusCodes.INSUFFICIENT_SPACE_ON_RESOURCE){
    logger.error({
      message: 'Stability AI rate limit reached',
      data: response.data
    });

    return {
      status: StatusCodes.INSUFFICIENT_SPACE_ON_RESOURCE,
      data: response.data,
      message: 'Insufficient space on resource'
    };
  }

  logger.error({
    message: 'Unknown error',
    data: response.data
  });

  return {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    data: response.data,
    message: 'Unknown error'
  };
};