import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function userRoutes(app: FastifyInstance) {
  // Get current user profile
  app.get('/me', {
    preHandler: [app.authenticate]
  }, async (request) => {
    const userId = (request.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { status: true }
    });
    
    if (!user) {
      throw app.httpErrors.notFound('User not found');
    }
    
    return user;
  });

  // Charge jewels (Mock/Test API)
  app.post('/charge', {
    preHandler: [app.authenticate],
    schema: {
      description: 'Charge jewels (Mock for testing)',
      tags: ['user'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', minimum: 1 }
        }
      }
    }
  }, async (request, reply) => {
    const body = request.body as { amount: number } | undefined;
    const userId = (request.user as any).id;

    if (!body || !body.amount || body.amount <= 0) {
      return reply.status(400).send({ success: false, error: 'Invalid amount' });
    }

    const { amount } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        jewels: { increment: amount }
      }
    });

    return {
      success: true,
      jewels: updatedUser.jewels,
      message: `${amount} jewels charged successfully (Mock).`
    };
  });
}
