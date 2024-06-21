import axios from "axios";
import logger from "../../../utils/logger";
import { BackgroundRemovalPayload } from "./types";
import { thirdPartyApiConfigs } from "../../../configs/configs";
import { getStabilityFetchResponse } from "../../../utils/utils";
import { StatusCodes } from "http-status-codes";
import FormData from "form-data";

import { Readable } from 'stream';
import prisma from "../../../prisma/client";
import { setImageBackgroundRemovalState } from "../../../state/backgroundRemoval";

export const backgroundRemoval = async ({ imageBuffer, imageId, imageName, userId }: BackgroundRemovalPayload) => {
  try {
    const extension = 'png';

    const { credits, endpoint } = thirdPartyApiConfigs.stabilityAi.backgroundRemoval;

    const readable = new Readable({
      read() {
        this.push(Buffer.from(imageBuffer));
        this.push(null);
      }
    });

    const form = new FormData();

    form.append('image', readable);
    form.append('output_format', extension);

    const backgroundRemovalResponse = await axios.postForm(endpoint, {
      validateStatus: undefined,
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`,
        Accept: "application/json"
      },
      data: form
    }
    );

    const response = getStabilityFetchResponse({ response: backgroundRemovalResponse });

    if (response.status === StatusCodes.OK) {
      await prisma.users.update({
        data: {
          credits: {
            decrement: credits
          }
        },
        where: {
          id: userId
        }
      });

      await setImageBackgroundRemovalState({
        imageId,
        status: 'processed',
        imageName,
        base64Image: `data:image/${extension};base64,${backgroundRemovalResponse.data.toString('base64')}`
      });

      return;
    }

    await setImageBackgroundRemovalState({ imageId, base64Image: '', imageName, status: 'failed' });

  } catch (e) {
    try {
      await setImageBackgroundRemovalState({ imageId, base64Image: '', imageName, status: 'failed' });
    } catch (error) {
      logger.error({
        message: 'Error setting image background removal state', functionName: 'backgroundRemoval', error
      });
    }

    logger.error({ message: 'Error removing background', functionName: 'backgroundRemoval', error: e });
  }

};