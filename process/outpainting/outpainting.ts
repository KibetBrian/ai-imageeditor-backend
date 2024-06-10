import { Request, Response, NextFunction } from 'express';
import { handleError } from "../../utils/utils";
import { StatusCodes } from 'http-status-codes';
import { incrementSdRemainingRequests } from '../../caching/redis';
import axios from "axios";
import FormData from "form-data";
import { outpaintingValidationSchema } from './validations';
import { validateAspectRatio } from './utils';
import logger from '../../utils/logger';

export const outpaint = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const validationResults = outpaintingValidationSchema.safeParse(req.body);
    if (!validationResults.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid request' });
    }

    const {down, left, outputFormat, right, up} = validationResults.data;

    await incrementSdRemainingRequests();

    const files = req.files as Express.Multer.File[];

    if (!files) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No files provided' });

    if (files.length !== 1) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Exactly one file is required' });

    const isAspectRationValid = await validateAspectRatio(files[0].buffer);

    if (!isAspectRationValid) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid aspect ratio' });

    const image = files[0].buffer.toString('binary');

    const payload = {
      image,
      left,
      down,
      right,
      up,
      // eslint-disable-next-line camelcase
      output_format: outputFormat
    };

    const response = await axios.postForm(
      `https://api.stability.ai/v2beta/stable-image/edit/outpaint`,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: { 
          Authorization: `Bearer sk-MYAPIKEY`, 
          Accept: `image/${outputFormat}` 
        }
      }
    );

    if (response.status === StatusCodes.BAD_REQUEST){
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'Invalid input'});
    }

    if (response.status=== StatusCodes.FORBIDDEN){
      return res.status(StatusCodes.FORBIDDEN).json({message: 'Your request was flagged by content moderation system'});
    }

    if (response.status === StatusCodes.REQUEST_TOO_LONG){
      return res.status(StatusCodes.REQUEST_TOO_LONG).json({message: 'Image too large, Please try again with a smaller image'});
    }

    if (response.status === StatusCodes.INTERNAL_SERVER_ERROR){
      logger.error({message: 'Internal server error by stable diffusion', functionName: 'outpaint', obj: {response}});
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'We are experiencing some issues. Please try again later'});
    }

    res.status(StatusCodes.OK).json({ message: 'Outpainting image', image: response.data});
  } catch (e) {
    handleError({
      error: e,
      functionName: 'outpaint',
      message: 'Error outpainting image',
      next
    });
  }
};