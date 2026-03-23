import { validateEnv, baseEnvSchema, z } from '@shared/config';

const envSchema = baseEnvSchema.extend({
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:4001'),
  POSTS_SERVICE_URL: z.string().url().default('http://localhost:4002'),
  PAYMENT_SERVICE_URL: z.string().url().default('http://localhost:4003'),
  AI_SERVICE_URL: z.string().url().default('http://localhost:4004'),
});

export const env = validateEnv(envSchema);
export type Env = typeof env;
