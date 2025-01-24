/* eslint-disable camelcase */
import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { StatusCodes } from 'http-status-codes';
import { thirdPartyEndpoints } from './constants';
import logger from '../utils/logger';
import { handleError } from '../utils/utils';

interface GenerateResponse {
  message?: string;
  data?: Buffer;
}

interface StableDiffusionResponse {
  status: number;
  data: Buffer;
}

type ErrorResponse = {
  logMessage: string;
  userMessage: string;
};

const ERROR_RESPONSES: Record<number, ErrorResponse> = {
  [StatusCodes.PAYMENT_REQUIRED]: {
    logMessage: 'Stable diffusion insufficient credits',
    userMessage: 'Internal server error'
  },
  [StatusCodes.FORBIDDEN]: {
    logMessage: 'Forbidden access',
    userMessage: 'Your request was flagged by our content moderation system, as a result your request was denied and you were not charged.'
  },
  [StatusCodes.REQUEST_TOO_LONG]: {
    logMessage: 'Request too long',
    userMessage: 'Image input should be less that 10MiB'
  },
  [StatusCodes.UNPROCESSABLE_ENTITY]: {
    logMessage: 'Unprocessable entity',
    userMessage: 'English is the only supported language for this service.'
  },
  [StatusCodes.TOO_MANY_REQUESTS]: {
    logMessage: 'Too many requests',
    userMessage: 'Internal server error'
  }
};

const handleStableDiffusionError = (status: number, responseData: Buffer): never => {
  const errorResponse = ERROR_RESPONSES[status];
  if (errorResponse) {
    logger.error({
      message: errorResponse.logMessage,
      response: responseData.toString()
    });
    throw new Error(errorResponse.userMessage);
  }
  throw new Error('Unknown error occurred');
};

const callStableDiffusionAPI = async (prompt: string): Promise<StableDiffusionResponse> => {
  if (!process.env.STABILITY_AI_API_KEY) {
    throw new Error('STABILITY_AI_API_KEY is not configured');
  }

  const formData = {
    prompt,
    output_format: 'jpeg'
  };

  try {
    const response = await axios.postForm(
      thirdPartyEndpoints.sd3ImageGeneration,
      axios.toFormData(formData, new FormData()),
      {
        validateStatus: undefined,
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`,
          Accept: 'image/*'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    return {
      status: response.status,
      data: response.data
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    logger.error({
      message: 'Failed to call Stable Diffusion API',
      error: axiosError.message
    });
    throw new Error('Failed to generate image');
  }
};

const validatePrompt = (prompt: string | undefined): void => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required and must be a string');
  }

  const promptMaximalLength = 1000;

  if (prompt.length > promptMaximalLength) {
    throw new Error('Prompt exceeds maximum length of 1000 characters');
  }
};

export const generate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<GenerateResponse>> => {
  try {
    const startTime = Date.now();
    validatePrompt(req.body.prompt);

    logger.info({
      message: 'Starting image generation',
      prompt: req.body.prompt
    });

    const response = await callStableDiffusionAPI(req.body.prompt);

    if (response.status !== StatusCodes.OK) {
      handleStableDiffusionError(response.status, response.data);
    }

    const imageBuffer = Buffer.from(response.data);

    logger.info({
      message: 'Image generation completed successfully',
      processingTime: Date.now() - startTime
    });

    return res
      .status(StatusCodes.OK)
      .set({
        'Content-Type': 'image/jpeg',
        'Content-Length': imageBuffer.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private'
      })
      .send(imageBuffer);

  } catch (error) {
    logger.error({
      message: 'Error in image generation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error instanceof Error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message
      });
    }

    handleError({
      error,
      functionName: 'generate',
      message: 'Error generating image',
      next
    });

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error'
    });
  }
};