import { validateEnv, baseEnvSchema, z } from '@shared/config';

const envSchema = baseEnvSchema.extend({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
});

export const env = validateEnv(envSchema);
export type Env = typeof env;
