/* eslint-disable camelcase */
import { Request, Response, NextFunction } from "express";
import { getStabilityFetchResponse, handleError } from "../../utils/utils";
import { generateImageValidationSchema } from "./validations";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import FormData from "form-data";
import { thirdPartyApiConfigs } from "../../configs/configs";
import prisma from "../../prisma/client";
import { handleLogError } from "../../utils/handleLogError";

export const generate = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const validationResults = generateImageValidationSchema.safeParse(req.body);

    if (!validationResults.success) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid request' });

    const { aspectRatio, negativePrompt, outputFormat, prompt, model } = validationResults.data;

    const payload = {
      prompt,
      output_format: outputFormat,
      negative_prompt: negativePrompt,
      aspect_ratio: aspectRatio
    };

    const { credits, endpoint } = thirdPartyApiConfigs.stabilityAi.imageGeneration.models[model];

    if (!endpoint) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Invalid request' });
    }

    const stabilityResponse = await axios.postForm(
      endpoint,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`,
          Accept: "image/*"
        }
      }
    );

    const response = getStabilityFetchResponse({ response: stabilityResponse });

    if (response.status !== StatusCodes.OK) {
      handleLogError(response);

      return res.status(response.status).json({ message: response.message });
    }

    await prisma.users.update({
      where: {
        userId: req.user.userId
      },
      data: {
        credits: {
          decrement: credits
        }
      }
    });

    const base64Image = Buffer.from(response.data).toString('base64');

    return res.status(StatusCodes.OK).json({ images: [base64Image] });
  } catch (e) {
    handleError({
      error: e,
      message: 'Error generating image',
      next,
      functionName: 'generate'
    });
  }
};