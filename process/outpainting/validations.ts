import {z} from 'zod';

const seedMax = 4294967294;
const sidesMax=2000;

export const outpaintingValidationSchema = z.object({
  outputFormat: z.enum(['jpeg', 'png', 'webp']),
  left: z.number().min(0).max(sidesMax),
  down: z.number().min(0).max(sidesMax),
  right: z.number().min(0).max(sidesMax),
  up: z.number().min(0).max(sidesMax),
  prompt: z.string().optional(),
  seed: z.number().min(0).max(seedMax ).optional(),
  creativity: z.number().min(0).max(1).optional()
});
