import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (fastify) => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-me-later',
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err: any) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: err.message || 'Authentication required'
      });
    }
  });
});
