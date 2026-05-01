import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { dreamRoutes } from './routes/dream.routes.js';

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
    },
  },
});

// Swagger Configuration
await app.register(swagger, {
  openapi: {
    info: {
      title: '사주다로 API',
      description: 'Dream Interpretation & Tarot API',
      version: '1.0.0',
    },
  },
});

await app.register(swaggerUi, {
  routePrefix: '/docs',
});

// CORS: Allow all for local network access
await app.register(cors, { origin: '*' });
await app.register(sensible);

// Routes
await app.register(dreamRoutes, { prefix: '/api/dream' });

app.get('/', async () => ({ 
  message: 'Welcome to 사주다로 (Dream Tarot) API',
  docs: '/docs',
  health: '/health'
}));

app.get('/health', async () => ({ status: 'ok' }));

try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`🚀 Server listening on http://${HOST}:${PORT}`);
  console.log(`📄 Swagger documentation available at http://${HOST}:${PORT}/docs`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
