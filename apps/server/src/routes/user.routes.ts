import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function userRoutes(app: FastifyInstance) {
  // Get current user profile
  app.get('/me', {
    preHandler: [app.authenticate],
    schema: {
      description: 'Get current user profile',
      tags: ['user'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { $ref: 'User#' }
      }
    }
  }, async (request) => {
    const userId = (request.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { status: true }
    });
    
    if (!user) {
      throw app.httpErrors.notFound('User not found');
    }
    
    const { status, ...rest } = user;
    return {
      ...rest,
      nickname: user.nickname || user.name || '',
      recentWorry: status?.recentWorry || null,
      feeling: status?.feeling || null
    };
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
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            jewels: { type: 'number' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const body = request.body as { amount: number } | undefined;
    const userId = (request.user as any).id;

    if (!body || !body.amount || body.amount <= 0) {
      return reply.status(400 as any).send({ success: false, error: 'Invalid amount' });
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

  // Update user current status (Worry and Feeling)
  app.put('/status', {
    preHandler: [app.authenticate],
    schema: {
      description: 'Update user current status (worries and feelings)',
      tags: ['user'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          recentWorry: { type: 'string', nullable: true },
          feeling: { type: 'string', nullable: true }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                recentWorry: { type: 'string', nullable: true },
                feeling: { type: 'string', nullable: true }
              }
            }
          }
        }
      }
    }
  }, async (request) => {
    const userId = (request.user as any).id;
    const body = request.body as { recentWorry?: string | null; feeling?: string | null } | undefined;

    const recentWorry = body?.recentWorry ?? null;
    const feeling = body?.feeling ?? null;

    const status = await prisma.userStatus.upsert({
      where: { userId },
      update: { recentWorry, feeling },
      create: { userId, recentWorry, feeling }
    });

    return {
      success: true,
      data: {
        recentWorry: status.recentWorry,
        feeling: status.feeling
      }
    };
  });
}
