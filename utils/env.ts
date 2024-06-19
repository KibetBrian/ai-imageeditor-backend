import { z } from 'zod';

const envVariableSchema = z.object({
  DATABASE_URL: z.string().url().min(1, { message: "DATABASE_URL cannot be empty" }),
  APPLICATION_PORT: z.string().min(1, { message: "PORT cannot be empty" }),
  STABILITY_AI_API_KEY: z.string().min(1, { message: "STABILITY_AI_API_KEY cannot be empty" }),
  REDIS_URL: z.string().url().min(1, { message: "REDIS_URL cannot be empty" }),
  R2_SECRET_ACCESS_KEY:z.string(),
  R2_ACCESS_KEY_ID:z.string(),
  CLOUDFLARE_ACCOUNT_ID:z.string(),
  SUPABASE_JWT_SECRET_KEY:z.string()
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariableSchema> { }
  }
}

// This function checks if the environment variables are set correctly
export const envVariablesChecker = () => {
  const result = envVariableSchema.safeParse(process.env);

  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error('Error parsing env values', result.error.format());
    process.exit(1);
  }
};
