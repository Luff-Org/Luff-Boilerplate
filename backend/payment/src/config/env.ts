import { validateEnv, baseEnvSchema, z } from '@shared/config';

const envSchema = baseEnvSchema.extend({
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder'),
  RAZORPAY_KEY_SECRET: z.string().default('placeholder_secret'),
  JWT_SECRET: z.string().default('dev-jwt-secret-change-in-production'),
});

export const env = validateEnv(envSchema);
export type Env = typeof env;
