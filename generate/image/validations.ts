import { z } from 'zod';

const maximumPromptLength = 10000;
const negativePromptLength = 10000;
const maximumSeed = 4294967294;
const maximumNumberImages = 4;

export const generateImageValidationSchema = z.object({
  prompt: z.string().min(1).max(maximumPromptLength),
  seed: z.number().int().min(0).max(maximumSeed),
  aspectRatio: z.enum(["16:9", "1:1", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"]),
  outputFormat: z.enum(["jpeg", "png", "webp"]).optional(),
  negativePrompt: z.string().min(0).max(negativePromptLength),
  model: z.enum(["ultra", "core", "sd3"]),
  numberOfImages: z.number().int().min(1).max(maximumNumberImages)
});

export const getImagesValidationSchema = z.object({
  userId: z.string().cuid()
});