import { NextFunction, Request, Response } from 'express';
import { incrementSdRemainingRequests } from '../state/redis';
import { handleError } from '../utils/utils';

export const updateSdRemainingRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await incrementSdRemainingRequests(1);

    next();
  } catch (err) {
    handleError({
      error: err,
      functionName: 'updateSdRemainingRequests',
      message: 'Error updating the remaining requests',
      next
    });
  }

};