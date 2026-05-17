import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function authRoutes(app: FastifyInstance) {
  // Mock Login for Testing
  app.post('/mock-login', {
    schema: {
      description: 'Mock login for testing purposes',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string', nullable: true },
                jewels: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const body = request.body as { email: string; name?: string } | undefined;
    
    if (!body || !body.email) {
      return reply.status(400).send({ success: false, error: 'Email is required' });
    }

    const { email, name } = body;

    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        jewels: 50, // Give 50 jewels for new users
      }
    });

    const token = app.jwt.sign({ id: user.id, email: user.email });
    
    return { success: true, token, user };
  });

  // OAuth logic would go here (Google, Kakao)
  // For now, we provide the structure
  app.get('/google', async (request, reply) => {
    // This would redirect to Google
    return { message: 'Redirect to Google OAuth...' };
  });

  app.get('/kakao', async (request, reply) => {
    // This would redirect to Kakao
    return { message: 'Redirect to Kakao OAuth...' };
  });
}
