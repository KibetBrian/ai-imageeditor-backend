import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getStabilityFetchResponse, handleError } from '../../utils/utils';
import axios from "axios";
import FormData from "form-data";
import logger from '../../utils/logger';
import { incrementSARemainingRequests } from '../../state/redis';
import { thirdPartyApiConfigs } from '../../configs/configs';
import prisma from '../../prisma/client';
import { makeBlackAndWhite } from './utils';

export const removeObject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await incrementSARemainingRequests(1);

    const outputFormat = 'png';
    const files = req.files as Express.Multer.File[];

    if (!files) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No files provided' });

    const filesRequired = 2;

    if (files.length !== filesRequired) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Exactly two files are required' });

    const mask = files.find(file => file.originalname === 'mask.png');
    const image = files.find(file => file.originalname !== 'mask.png');

    if (!mask || !image) {
      logger.error({ message: 'Missing files', functionName: 'removeObject', obj: { mask, image } });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid request' });
    }

    const { credits, endpoint } = thirdPartyApiConfigs.stabilityAi.objectErasal;

    const formData = new FormData();

    const maskBuffer= await makeBlackAndWhite(mask.buffer);

    formData.append('image', image.buffer, {
      contentType: 'image/png',
      filename: image.originalname
    });

    formData.append('mask', maskBuffer, {
      contentType: 'image/png',
      filename: mask.originalname
    });

    formData.append('output_format', outputFormat);
   
    const objectErasalResponse = await axios.postForm(
      endpoint,
      formData,
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`,
          Accept: `image/*`
        }
      }
    );

    const response = getStabilityFetchResponse({response: objectErasalResponse});

    if (response.status !== StatusCodes.OK) {
      return res.status(response.status).json({ message: response.message});
    }

    await prisma.users.update({
      data:{
        credits:{
          decrement: credits
        }
      },
      where:{
        userId: req.user.userId
      }
    });

    res.status(StatusCodes.OK).json({ message: 'Object removed successfully', image: Buffer.from(image.buffer).toString('base64') });
  } catch (error) {
    handleError({
      error: error,
      message: 'Error removing object',
      functionName: 'removeObject',
      next: next
    });
  }
};