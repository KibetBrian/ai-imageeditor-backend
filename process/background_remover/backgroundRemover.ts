/* eslint-disable max-lines-per-function */
import { Request, Response, NextFunction } from "express";
import { generateCuid, handleError } from "../../utils/utils";
import { StatusCodes } from "http-status-codes";
import { incrementSdRemainingRequests } from "../../caching/redis";
import { afterSuccessfulProcess } from './afterProcess';
import axios from "axios";

export const removeBackground = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No files uploaded' });

    const rateLimitingPromise = [];
    for (let i = 0; i < files.length; i++) {
      rateLimitingPromise.push(incrementSdRemainingRequests());
    }
    await Promise.all(rateLimitingPromise);

    // Simulate file processing
    // eslint-disable-next-line no-magic-numbers
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const promises = files.map((f) => {

      const parts = f.originalname.split('.');

      const extension = parts[parts.length - 1];

      const payload = {
        image: f.buffer,
        // eslint-disable-next-line camelcase
        output_format: extension
      };

      const backgroundRemovalResponse = axios.postForm(
        `https://api.stability.ai/v2beta/stable-image/edit/remove-background`,
        axios.toFormData(payload, new FormData()),
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer sk-MYAPIKEY`,
            Accept: `application/json`
          }
        }
      );

      return backgroundRemovalResponse;
    });

    const fileFormattedNames = files.map((f) => {
      const parts = f.originalname.split('.');

      const extension = parts[parts.length - 1];

      const id = generateCuid();

      const newName = `${parts.slice(0, parts.length - 1).join('')}_background_removed.${id}.${extension}`;

      return newName;

    });

    const results = await Promise.all(promises);

    const processedFiles = results.map((r, index) => {
      return {
        name: fileFormattedNames[index],
        data: r.data
      };
    });

    res.status(StatusCodes.ACCEPTED).json({ message: 'Success', files: processedFiles });

    await afterSuccessfulProcess({
      files: processedFiles,
      userId: req.user.userId
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
