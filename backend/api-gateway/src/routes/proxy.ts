import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { createLogger } from '@shared/logger';

import { env } from '../config/env';

const log = createLogger('gateway-proxy');

function createServiceProxy(target: string, pathPrefix: string) {
  const options: Options = {
    target,
    changeOrigin: true,
    on: {
      proxyReq: (_proxyReq, req) => {
        log.info({ target, path: req.url }, `Proxying ${pathPrefix} request`);
      },
      error: (err, _req, res) => {
        log.error({ err, target }, 'Proxy error');
        if ('writeHead' in res && typeof res.writeHead === 'function') {
          (res as import('http').ServerResponse)
            .writeHead(502, { 'Content-Type': 'application/json' });
          (res as import('http').ServerResponse)
            .end(JSON.stringify({ success: false, error: 'Service unavailable' }));
        }
      },
    },
  };

  return createProxyMiddleware(options);
}

export const authProxy = createServiceProxy(env.AUTH_SERVICE_URL, '/auth');
export const postsProxy = createServiceProxy(env.POSTS_SERVICE_URL, '/posts');
