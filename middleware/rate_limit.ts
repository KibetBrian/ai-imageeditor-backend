import { NextFunction, Request, Response } from 'express';
import { incrementSdRemainingRequests } from '../caching/redis';
import { handleError } from '../utils/utils';

export const  updateSdRemainingRequests = async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  try {
    await incrementSdRemainingRequests();

    next();
  } catch (err){
    handleError({
      error: err,
      functionName: 'updateSdRemainingRequests',
      message: 'Error updating the remaining requests',
      next
    });
  }

};