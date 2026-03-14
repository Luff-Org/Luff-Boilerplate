const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serviceName = process.argv[2];
const servicePort = process.argv[3];

if (!serviceName || !servicePort) {
  console.error('❌ Error: Please provide a service name and a port number.');
  console.log('Usage: node scripts/create-service.js <service-name> <port>');
  process.exit(1);
}

const backendDir = path.join(__dirname, '..', 'backend', serviceName);

if (fs.existsSync(backendDir)) {
  console.error(`❌ Error: Service '${serviceName}' already exists.`);
  process.exit(1);
}

console.log(`🚀 Creating new boilerplate service: ${serviceName}...`);

// Scaffold directories
const dirs = [
  '',
  'src',
  'src/config',
  'src/controllers',
  'src/db',
  'src/middlewares',
  'src/routes',
  'src/services',
];

dirs.forEach((dir) => {
  fs.mkdirSync(path.join(backendDir, dir), { recursive: true });
});

// Templates
const packageJson = {
  name: `@backend/${serviceName}`,
  version: '1.0.0',
  private: true,
  scripts: {
    dev: 'tsx watch src/index.ts',
    build: 'tsc',
    start: 'node dist/index.js',
    lint: 'eslint src/',
  },
  dependencies: {
    '@shared/config': '*',
    '@shared/logger': '*',
    '@shared/types': '*',
    express: '^4.18.0',
    cors: '^2.8.5',
    helmet: '^7.1.0',
  },
  devDependencies: {
    '@shared/eslint-config': '*',
    '@types/express': '^4.17.0',
    '@types/cors': '^2.8.0',
    tsx: '^4.7.0',
    typescript: '^5.4.0',
  },
};

const tsconfig = {
  extends: '../../tsconfig.base.json',
  compilerOptions: {
    outDir: './dist',
    rootDir: './src',
  },
  include: ['src'],
};

const eslintrc = `module.exports = {
  extends: ['@shared/eslint-config'],
};
`;

const dockerfile = `FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/${serviceName}/package.json ./backend/${serviceName}/
COPY shared/types/package.json ./shared/types/
COPY shared/logger/package.json ./shared/logger/
COPY shared/config/package.json ./shared/config/
RUN npm install --workspace=@backend/${serviceName}

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/${serviceName}/node_modules ./backend/${serviceName}/node_modules
COPY shared/ ./shared/
COPY backend/${serviceName}/ ./backend/${serviceName}/
COPY tsconfig.base.json ./
RUN npm run build --workspace=@shared/types
RUN npm run build --workspace=@shared/logger
RUN npm run build --workspace=@shared/config
RUN npm run build --workspace=@backend/${serviceName}

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/backend/${serviceName}/dist ./dist
COPY --from=builder /app/backend/${serviceName}/node_modules ./node_modules
COPY --from=builder /app/backend/${serviceName}/package.json ./
USER appuser
EXPOSE ${servicePort}
CMD ["node", "dist/index.js"]
`;

const envTs = `import { validateEnv, baseEnvSchema } from '@shared/config';

const envSchema = baseEnvSchema.extend({});

export const env = validateEnv(envSchema);
export type Env = typeof env;
`;

const errorTs = `import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@shared/logger';

const log = createLogger('${serviceName}-error-handler');

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  log.error({ err }, 'Unhandled error');
  res.status(500).json({ success: false, error: 'Internal server error' });
}
`;

const indexTs = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from '@shared/logger';

import { env } from './config/env';
import { errorHandler } from './middlewares/error';

const log = createLogger('${serviceName}-service');
const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: '${serviceName}' });
});

// Register routes here

app.use(errorHandler);

async function start() {
  app.listen(env.PORT || 4000, () => {
    log.info(\`${serviceName} service running on port \${env.PORT || 4000}\`);
  });
}

start().catch((err) => {
  log.error({ err }, 'Failed to start ${serviceName} service');
  process.exit(1);
});
`;

const readme = `# ${serviceName}

Boilerplate microservice running on Express.
`;

const envExample = `PORT=${servicePort}
NODE_ENV=development
`;

// Write Files
const writeFile = (filePath, content) => {
  fs.writeFileSync(path.join(backendDir, filePath), content);
};

writeFile('package.json', JSON.stringify(packageJson, null, 2) + '\n');
writeFile('tsconfig.json', JSON.stringify(tsconfig, null, 2) + '\n');
writeFile('.eslintrc.js', eslintrc);
writeFile('Dockerfile', dockerfile);
writeFile('src/config/env.ts', envTs);
writeFile('src/middlewares/error.ts', errorTs);
writeFile('src/index.ts', indexTs);
writeFile('README.md', readme);
writeFile('.env.example', envExample);
writeFile('.env', envExample);

console.log('📦 Installing workspace dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (e) {
  console.error('Failed to run npm install');
}

console.log('✅ Successfully created backend/' + serviceName + ' on port ' + servicePort);
console.log('Next steps:');
console.log('1. cd backend/' + serviceName);
console.log('2. Copy .env.example to .env');
console.log(
  '3. Add this service to the API Gateway config in `backend/api-gateway/src/index.ts` and its `.env`',
);
console.log('4. Run "npm run dev --workspace=@backend/' + serviceName + '" to start');
