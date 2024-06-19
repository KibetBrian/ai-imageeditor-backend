 
/* eslint-disable camelcase */
import { Request, Response, NextFunction } from "express";
import { generateCuid, handleError } from "../../utils/utils";
import { generateImageValidationSchema } from "./validations";
import { StatusCodes } from "http-status-codes";
import { configs } from "../../configs/configs";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { storeImage } from "../../utils/r2";
import prismaClient from "../../prisma/client";

export const simulate = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const userId = '66544138aa3c1d8cb7479a67';

    const validationResults = generateImageValidationSchema.safeParse(req.body);
    if (!validationResults.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid request' });
    }

    const { aspectRatio, negativePrompt, outputFormat, prompt, model,numberOfImages, seed } = validationResults.data;
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
    
    const _fileName = fileURLToPath(import.meta.url);

    const _dirname = path.dirname(_fileName);

    const files = await fs.readdir(_dirname);

    const imageFiles = files.filter((file) => file.endsWith('.jpg'));

    const images = await Promise.all(imageFiles.map(async (image) => {
      const binary = await fs.readFile(path.join(_dirname, image));
      // Convert the binary data to a Base64 encoded string
      
      const imageName = generateCuid();

      const imageKey= `${userId}-${imageName}.png`;

      const results = await storeImage({
        body: binary,
        bucketName: 'image-editor',
        key: imageKey
      });

      try{
        await prismaClient.images.create({
          data:{
            key:imageKey,
            userId,
            createdAt: new Date()
          }
        });
      }catch(e){
        console.log('Error saving image:', e)
      }
      console.log('Image saved')

      return results;
    }));

    return res.status(StatusCodes.OK).json({ message: 'Images generated', images });
  } catch (e) {
    handleError({
      error: e,
      message: 'Error generating image',
      next,
      functionName: 'generate'
    });
  }
};