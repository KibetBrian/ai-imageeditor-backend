import {z} from 'zod';

export const getProcessedImagesValidationSchema = z.object({
  imageIds: z.array(z.string())
});