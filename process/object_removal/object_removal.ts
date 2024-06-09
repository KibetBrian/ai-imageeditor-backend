import {Request, Response, NextFunction} from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../../utils/utils';
import axios from "axios";
import FormData from "form-data";
import logger from '../../utils/logger';
import { makeBlackAndWhite } from './utils';
import { ObjectRemovalApiResponseHeaders } from './types';
import {incrementSdRemainingRequests } from '../../caching/redis';

export const removeObject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await incrementSdRemainingRequests();

    const outputFormat ='png';
    const files = req.files as Express.Multer.File[];

    if (!files) return res.status(StatusCodes.BAD_REQUEST).json({message: 'No files provided'});

    const filesRequired=2;

    if (files.length !== filesRequired) return res.status(StatusCodes.BAD_REQUEST).json({message: 'Exactly two files are required'});

    const mask = files.find(file => file.originalname === 'mask.png');
    const image = files.find(file => file.originalname !== 'mask.png');

    if (!mask || !image) {
      logger.error({message: 'Missing files', functionName: 'removeObject', obj: {mask, image}});
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'Invalid request'});
    }

    const blackAndWhiteMask = await makeBlackAndWhite(mask.buffer);

    const payload = {
      image:image.buffer,
      mask:blackAndWhiteMask,
      // eslint-disable-next-line camelcase
      output_format: outputFormat
    };

    const response = await axios.postForm(
      `https://api.stability.ai/v2beta/stable-image/edit/erase`,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: { 
          Authorization: `Bearer sk-MYAPIKEY`, 
          Accept: `image/{outputFormat}` 
        }
      }
    );

    const responseHeaders = response.headers as unknown as ObjectRemovalApiResponseHeaders;

    const base64Image = response.data;

    if (responseHeaders['finish-reason'] === 'CONTENT_FILTERED') {
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'Your request was flagged by content moderation system'});
    }

    if (response.status===StatusCodes.INTERNAL_SERVER_ERROR){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'We are experiencing some issues. Please try again later'});
    }

    if (response.status===StatusCodes.REQUEST_TOO_LONG){
      return res.status(StatusCodes.REQUEST_TOO_LONG).json({message: 'Image too large, Please try again with a smaller image'});
    }

    res.status(StatusCodes.OK).json({message: 'Object removed successfully', image: base64Image});
  } catch (error) {
    handleError({
      error: error,
      message: 'Error removing object',
      functionName: 'removeObject',
      next: next
    });
  }
};