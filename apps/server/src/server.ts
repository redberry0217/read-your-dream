import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';

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

await app.register(cors, { origin: true });
await app.register(sensible);

app.get('/health', async () => ({ status: 'ok' }));

try {
  await app.listen({ port: PORT, host: HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
