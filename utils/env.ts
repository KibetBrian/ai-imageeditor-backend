import { z } from 'zod';

const envVariableSchema = z.object({
  DATABASE_URL: z.string().url().min(1, { message: "DATABASE_URL cannot be empty" }),
  PORT: z.string().min(1, { message: "PORT cannot be empty" })
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
