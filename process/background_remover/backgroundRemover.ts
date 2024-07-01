
import { Request, Response, NextFunction } from "express";
import { generateCuid, handleError } from "../../utils/utils";
import { StatusCodes } from "http-status-codes";
import { incrementSARemainingRequests } from "../../state/redis";
import { sendMessageToQueue } from "../../messaging/rabbitmq";
import { getImageBackgroundRemovalState, setImageBackgroundRemovalState } from "../../state/backgroundRemoval";
import { getProcessedImagesValidationSchema } from "./validations";
import { BackgroundRemovalQueuePayload, ImageBuffer } from "../../messaging/consumers/background_removal/types";

export const removeBackground = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No files uploaded' });

    await incrementSARemainingRequests(files.length);

    const imageIds = files.map(() => generateCuid());

    const promises = files.map(async (f, i) => {
      const imageId = imageIds[i];
      
      const queuePayload: BackgroundRemovalQueuePayload = {
        imageId,
        userId: req.user.userId,
        imageBuffer: f.buffer as unknown as ImageBuffer,
        imageName: f.originalname
      };

      return Promise.all([
        sendMessageToQueue({ 'queue': 'backgroundRemoval', payload: queuePayload }),
        setImageBackgroundRemovalState({ imageId, status: 'processing', base64Image: '', message: '', imageName: f.originalname })
      ]);
    });

    await Promise.all(promises);

    return res.status(StatusCodes.ACCEPTED).json({
      message: 'Image processing started',
      imageIds
    });

  } catch (e) {
    handleError({
      error: e,
      functionName: 'removeBackground',
      message: 'Error in remove background function',
      next
    });
  }
};

export const getProcessedImages = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const validationResults = getProcessedImagesValidationSchema.safeParse({ imageIds: req.body.imageIds });

    if (!validationResults.success) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid request' });

    const { imageIds } = validationResults.data;

    const promises = imageIds.map((imageId: string) => {
      const imageState = getImageBackgroundRemovalState({ imageId });

      return imageState;
    });

    const images = await Promise.all(promises);

    return res.status(StatusCodes.OK).json({
      images,
      message: 'Success'
    });

  } catch (e) {
    handleError({
      error: e,
      functionName: 'getProcessedImage',
      message: 'Error in get processed image function',
      next
    });
  }
};
