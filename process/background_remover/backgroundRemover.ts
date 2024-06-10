import { Request, Response, NextFunction } from "express";
import { handleError } from "../../utils/utils";
import { StatusCodes } from "http-status-codes";
import { incrementSdRemainingRequests } from "../../caching/redis";

export const removeBackground = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No files uploaded' });
    }

    const rateLimitingPromise=[];
    for (let i=0; i<files.length; i++){
      rateLimitingPromise.push( incrementSdRemainingRequests());
    }
    
    await Promise.all(rateLimitingPromise);

    // Simulate file processing
    // eslint-disable-next-line no-magic-numbers
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const processedFiles = files.map((f)=>{

      const parts = f.originalname.split('.');

      const extension = parts[parts.length-1];

      const newName = `${parts.slice(0, parts.length-1).join('')}_background_removed.${extension}`;

      return {
        ...f, 
        name: newName
      };
    });

    res.status(StatusCodes.ACCEPTED).json({ message: 'Success', files:processedFiles });

  } catch (e) {
    handleError({
      error: e,
      functionName: 'removeBackground',
      message: 'Error in remove background function',
      next
    });
  }
};
