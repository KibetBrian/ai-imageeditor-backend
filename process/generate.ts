/* eslint-disable max-lines-per-function */
import {Request, Response, NextFunction} from 'express';
import axios from "axios";
import FormData from "form-data";

import { StatusCodes } from 'http-status-codes';
import { thirdPartyEndpoints } from './constants';
import logger from '../utils/logger';
import { handleError } from '../utils/utils';

export const generate = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const formData = {
      prompt: req.body.prompt,
      // eslint-disable-next-line camelcase
      output_format: "jpeg"
    };

    const response = await axios.postForm(
      thirdPartyEndpoints.sd3ImageGeneration,
      axios.toFormData(formData, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: { 
          Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`, 
          Accept: "image/*" 
        }
      }
    );

    //TODO: add switch case

    if (response.status=== StatusCodes.PAYMENT_REQUIRED){
      logger.error({message: 'Stable diffusion insufficient credits', response: response.data.toString()});

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error'
      });
    }

    if (response.status === StatusCodes.FORBIDDEN){
      logger.error({message: 'Forbidden access', response: response.data.toString()});

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Your request was flagged by our content moderation system, as a result your request was denied and you were not charged.'
      });
    }

    if (response.status===StatusCodes.REQUEST_TOO_LONG){
      logger.error({message: 'Request too long', response: response.data.toString()});
    
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Image input should be less that 10MiB'
      });
    }

    if (response.status===StatusCodes.UNPROCESSABLE_ENTITY){
      logger.error({message: 'Unprocessable entity', response: response.data.toString()});
    
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'English is the only supported language for this service.'
      });
    }

    if (response.status===StatusCodes.TOO_MANY_REQUESTS){
      logger.error({message: 'Too many requests', response: response.data.toString()});
        
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error'
      });
    }

    const imageBuffer = Buffer.from(response.data);

    res.writeHead(StatusCodes.OK, {
      "Content-Type": "image/jpeg",
      "Content-Length": imageBuffer.length
    });

    res.send(imageBuffer);

    res.end();
  } catch (e){
    handleError({
      error: e,
      functionName: "generate",
      message: "Error generating image",
      next
    });
  }
};