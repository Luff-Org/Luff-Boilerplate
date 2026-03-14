import { config } from 'dotenv';
import { z, ZodSchema } from 'zod';

config();

export function validateEnv<T extends ZodSchema>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    console.error('❌ Invalid environment variables:', formatted);
    process.exit(1);
  }

  return result.data;
}

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
});

export { z };
