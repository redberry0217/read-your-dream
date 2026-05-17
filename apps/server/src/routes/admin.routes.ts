import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function adminRoutes(app: FastifyInstance) {
  // Admin authentication preHandler
  const adminAuth = async (request: any, reply: any) => {
    const adminKey = request.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_API_KEY ?? 'super-secret-admin-key';
    
    if (!adminKey || adminKey !== expectedKey) {
      return reply.status(401).send({ 
        success: false, 
        error: 'Unauthorized: Invalid x-admin-key header' 
      });
    }
  };

  // 1. Get admin dashboard stats
  app.get('/stats', {
    preHandler: [adminAuth],
    schema: {
      description: 'Get admin portal dashboard metrics',
      tags: ['admin'],
      headers: {
        type: 'object',
        required: ['x-admin-key'],
        properties: {
          'x-admin-key': { type: 'string', description: 'Admin secret API Key' }
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
                totalUsers: { type: 'number' },
                totalLogs: { type: 'number' },
                freeLogs: { type: 'number' },
                premiumLogs: { type: 'number' },
                totalJewels: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async () => {
    const [totalUsers, totalLogs, freeLogs, premiumLogs, jewelsSum] = await Promise.all([
      prisma.user.count(),
      prisma.dreamLog.count(),
      prisma.dreamLog.count({ where: { type: 'FREE' } }),
      prisma.dreamLog.count({ where: { type: 'PREMIUM' } }),
      prisma.user.aggregate({ _sum: { jewels: true } })
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalLogs,
        freeLogs,
        premiumLogs,
        totalJewels: jewelsSum._sum.jewels ?? 0
      }
    };
  });

  // 2. Get all users
  app.get('/users', {
    preHandler: [adminAuth],
    schema: {
      description: 'Get list of all users with log counts',
      tags: ['admin'],
      headers: {
        type: 'object',
        required: ['x-admin-key'],
        properties: {
          'x-admin-key': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string', nullable: true },
                  jewels: { type: 'number' },
                  provider: { type: 'string', nullable: true },
                  logCount: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  }, async () => {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { logs: true }
        }
      }
    });

    return {
      success: true,
      data: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        jewels: u.jewels,
        provider: u.provider,
        logCount: u._count.logs
      }))
    };
  });

  // 3. Adjust user jewels count (Admin CS Action)
  app.post('/users/:userId/jewels', {
    preHandler: [adminAuth],
    schema: {
      description: 'Adjust user jewels count by admin (increases/decreases)',
      tags: ['admin'],
      headers: {
        type: 'object',
        required: ['x-admin-key'],
        properties: {
          'x-admin-key': { type: 'string' }
        }
      },
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', description: 'Amount to add (positive) or subtract (negative)' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            userId: { type: 'string' },
            name: { type: 'string', nullable: true },
            jewels: { type: 'number' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { userId } = request.params as any;
    const { amount } = request.body as { amount: number };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404 as any).send({ success: false, error: 'User not found' });
    }

    // Keep jewels from going below 0
    const nextJewels = Math.max(0, user.jewels + amount);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { jewels: nextJewels }
    });

    return {
      success: true,
      userId: updated.id,
      name: updated.name,
      jewels: updated.jewels,
      message: `Successfully adjusted user jewels from ${user.jewels} to ${updated.jewels}.`
    };
  });

  // 4. Get all users' dream logs feed (Admin Auditing)
  app.get('/logs', {
    preHandler: [adminAuth],
    schema: {
      description: 'Get global feed of all users dream logs for auditing',
      tags: ['admin'],
      headers: {
        type: 'object',
        required: ['x-admin-key'],
        properties: {
          'x-admin-key': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  content: { type: 'string' },
                  type: { type: 'string' },
                  ohYok: { type: 'object', nullable: true },
                  chilJung: { type: 'object', nullable: true },
                  tarotCards: { type: 'string', nullable: true },
                  tarotAnalysis: { type: 'array', nullable: true },
                  summary: { type: 'string', nullable: true },
                  analysis: { type: 'string', nullable: true },
                  followUpQuestions: { type: 'array', nullable: true, items: { type: 'string' } },
                  followUpAnswers: { type: 'object', nullable: true },
                  finalReport: { type: 'string', nullable: true },
                  createdAt: { type: 'string' },
                  userId: { type: 'string' },
                  user: {
                    type: 'object',
                    properties: {
                      email: { type: 'string' },
                      name: { type: 'string', nullable: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async () => {
    const logs = await prisma.dreamLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      data: logs
    };
  });

  // 5. Update a tarot card dictionary metadata (Tuning prompt interpretation text)
  app.put('/tarots/:id', {
    preHandler: [adminAuth],
    schema: {
      description: 'Update a tarot card metadata dictionary entry',
      tags: ['admin'],
      headers: {
        type: 'object',
        required: ['x-admin-key'],
        properties: {
          'x-admin-key': { type: 'string' }
        }
      },
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number', description: 'Tarot card ID (1-78)' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          keywords: { type: 'string' },
          keywordsRev: { type: 'string' },
          meaningUpright: { type: 'string' },
          meaningReversed: { type: 'string' },
          practicalAdvice: { type: 'string' },
          orientalVibe: { type: 'string', nullable: true }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                category: { type: 'string' },
                keywords: { type: 'string' },
                keywordsRev: { type: 'string' },
                meaningUpright: { type: 'string' },
                meaningReversed: { type: 'string' },
                practicalAdvice: { type: 'string' },
                orientalVibe: { type: 'string', nullable: true }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    const cardId = Number(id);
    const body = request.body as any;

    const card = await prisma.tarotCard.findUnique({ where: { id: cardId } });
    if (!card) {
      return reply.status(404 as any).send({ success: false, error: 'Tarot card not found' });
    }

    const updated = await prisma.tarotCard.update({
      where: { id: cardId },
      data: body
    });

    return {
      success: true,
      message: 'Tarot card updated successfully',
      data: updated
    };
  });
}
