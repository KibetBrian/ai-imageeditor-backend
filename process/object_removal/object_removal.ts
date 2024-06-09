import {Request, Response, NextFunction} from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../../utils/utils';

export const removeObject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files) return res.status(StatusCodes.BAD_REQUEST).json({message: 'No files provided'});

    const filesRequired=2;

    if (files.length !== filesRequired) return res.status(StatusCodes.BAD_REQUEST).json({message: 'Exactly two files are required'});

    res.status(StatusCodes.OK).json({message: 'Object removed successfully'});
  } catch (error) {
    handleError({
      error: error,
      message: 'Error removing object',
      functionName: 'removeObject',
      next: next
    });
  }
};