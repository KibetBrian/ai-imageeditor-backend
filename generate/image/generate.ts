/* eslint-disable camelcase */
import { Request, Response, NextFunction } from "express";
import { handleError } from "../../utils/utils";
import { generateImageValidationSchema } from "./validations";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import FormData from "form-data";
import logger from "../../utils/logger";
import { configs } from "../../configs/configs";

export const generate = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const validationResults = generateImageValidationSchema.safeParse(req.body);
    if (!validationResults.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid request' });
    }

    const { aspectRatio, negativePrompt, outputFormat, prompt, model } = validationResults.data;
    const payload = {
      prompt,
      output_format: outputFormat,
      negative_prompt: negativePrompt,
      aspect_ratio: aspectRatio
    };

    const endpoint = configs.stableDiffusion.models.find((m) => m.name === model)?.endpoint;

    if (!endpoint) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Invalid request' });
    }

    const response = await axios.postForm(
      endpoint,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer sk-MYAPIKEY`,
          Accept: "image/*"
        }
      }
    );

    if (response.status===StatusCodes.UNAUTHORIZED){
      logger.error({ message: 'Unauthorized request', response: response.data });
      
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'We are experiencing some issues. Please try again later' });
    }

    if (response.status === StatusCodes.OK) {
      res.setHeader('Content-Type', `image/${outputFormat}`);
      res.status(StatusCodes.OK).json({ message: 'Image generated', image: response.data });
    }

    if (response.status === StatusCodes.BAD_REQUEST) {
      logger.error({ message: 'Invalid request', response: response.data });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid request' });
    }

    if (response.status === StatusCodes.INTERNAL_SERVER_ERROR) {
      logger.error({ message: 'Internal server error', response: response.data });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'We are experiencing some issues. Please try again later' });
    }

    if (response.status === StatusCodes.UNPROCESSABLE_ENTITY) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: 'Unsupported language' });
    }

    if (response.status === StatusCodes.INTERNAL_SERVER_ERROR) {
      logger.error({ message: 'Internal server error from stable diffusion response', response: response.data });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'We are experiencing some issues. Please try again later' });
    }

  } catch (e) {
    handleError({
      error: e,
      message: 'Error generating image',
      next,
      functionName: 'generate'
    });
  }
};