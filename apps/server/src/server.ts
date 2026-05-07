import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import authPlugin from './plugins/auth.plugin.js';
import { dreamRoutes } from './routes/dream.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { authRoutes } from './routes/auth.routes.js';

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
      title: '사주다로 (Dream Tarot) API',
      description: 'Dream interpretation with Gemini AI and Tarot',
      version: '0.1.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
});

await app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
});

// CORS: Allow all for local network access
await app.register(cors, { origin: '*' });
await app.register(sensible);
await app.register(authPlugin);

// Routes
await app.register(dreamRoutes, { prefix: '/api/dream' });
await app.register(userRoutes, { prefix: '/api/user' });
await app.register(authRoutes, { prefix: '/api/auth' });

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
