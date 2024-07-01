import axios from "axios";
import { BackgroundRemovalQueuePayload } from "./types";
import { thirdPartyApiConfigs } from "../../../configs/configs";
import { getStabilityFetchResponse } from "../../../utils/utils";
import { StatusCodes } from "http-status-codes";
import FormData from "form-data";

import prisma from "../../../prisma/client";
import { setImageBackgroundRemovalState } from "../../../state/backgroundRemoval";
import { handleLogError } from "../../../utils/handleLogError";
import { resizeImage } from "./utils";

export const backgroundRemoval = async ({ imageBuffer, imageId, imageName, userId }: BackgroundRemovalQueuePayload) => {
  try {

    const extension = 'png';

    const { credits, endpoint } = thirdPartyApiConfigs.stabilityAi.backgroundRemoval;

    const form = new FormData();

    const resizedImage = await resizeImage(imageBuffer.data);

    form.append('image', resizedImage, {
      contentType: 'image/png',
      filename: imageName
    });

    form.append('output_format', extension);

    const backgroundRemovalResponse = await axios.postForm(
      endpoint,
      form,
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`,
          Accept: "image/*"
        }
      }
    );

    const response = getStabilityFetchResponse({ response: backgroundRemovalResponse });

    if (response.status === StatusCodes.OK) {

      await prisma.$transaction(async (tx) => {

        const buffer: Buffer = response.data;

        const base64Image = Buffer.from(buffer).toString('base64');

        await setImageBackgroundRemovalState({
          imageId,
          message: 'image processed successfully',
          status: 'processed',
          imageName,
          base64Image
        });

        await tx.users.update({
          data: {
            credits: {
              decrement: credits
            }
          },
          where: {
            userId
          }
        });
      });

      return;
    }

    if (response.status === StatusCodes.REQUEST_TOO_LONG) {
      await setImageBackgroundRemovalState({ imageId, message: 'Image uploaded larger than 10 Mbs', base64Image: '', imageName, status: 'failed' });
      return;
    }

    await setImageBackgroundRemovalState({ imageId, message: 'error occured while processing image', base64Image: '', imageName, status: 'failed' });

  } catch (e) {
    try {
      await setImageBackgroundRemovalState({ imageId, message: 'error occured while processing image', base64Image: '', imageName, status: 'failed' });
    } catch (error) {
      handleLogError({
        message: 'Error setting image background removal state', functionName: 'backgroundRemoval', error
      });
    }
    handleLogError({ message: 'Error removing background', functionName: 'backgroundRemoval', error: e });
  }
};