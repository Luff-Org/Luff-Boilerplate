import { validateEnv, baseEnvSchema, z } from '@shared/config';

const envSchema = baseEnvSchema.extend({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
});

export const env = validateEnv(envSchema);
export type Env = typeof env;
