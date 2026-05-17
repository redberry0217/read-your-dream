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
            user: { $ref: 'User#' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const body = request.body as { email: string; name?: string } | undefined;
    
    if (!body || !body.email) {
      return reply.status(400 as any).send({ success: false, error: 'Email is required' });
    }

    const { email, name } = body;
    const finalNickname = name || email.split('@')[0];

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, nickname: finalNickname },
      create: {
        email,
        name,
        nickname: finalNickname,
        jewels: 50, // Give 50 jewels for new users
        provider: 'MOCK',
        providerId: `mock_${email}`
      }
    });

    const token = app.jwt.sign({ id: user.id, email: user.email });
    
    return { 
      success: true, 
      token, 
      user: {
        ...user,
        recentWorry: null,
        feeling: null
      }
    };
  });

  // Google mock social login for frontend seamless testing
  app.get('/google', {
    schema: {
      description: 'Mock Google OAuth Login for frontend testing',
      tags: ['auth'],
      querystring: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          name: { type: 'string' },
          redirect: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: { $ref: 'User#' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const query = request.query as { email?: string; name?: string; redirect?: string } | undefined;
    const email = query?.email || 'google_mock@gmail.com';
    const name = query?.name || '구글몽객';

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, nickname: name },
      create: {
        email,
        name,
        nickname: name,
        jewels: 50,
        provider: 'GOOGLE',
        providerId: `google_${email.split('@')[0]}`
      }
    });

    const token = app.jwt.sign({ id: user.id, email: user.email });

    if (query?.redirect === 'true') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return reply.redirect(`${frontendUrl}?token=${token}&userId=${user.id}`);
    }

    return { 
      success: true, 
      token, 
      user: {
        ...user,
        recentWorry: null,
        feeling: null
      }
    };
  });

  // Kakao mock social login for frontend seamless testing
  app.get('/kakao', {
    schema: {
      description: 'Mock Kakao OAuth Login for frontend testing',
      tags: ['auth'],
      querystring: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          name: { type: 'string' },
          redirect: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: { $ref: 'User#' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const query = request.query as { email?: string; name?: string; redirect?: string } | undefined;
    const email = query?.email || 'kakao_mock@kakao.com';
    const name = query?.name || '카카오몽객';

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, nickname: name },
      create: {
        email,
        name,
        nickname: name,
        jewels: 50,
        provider: 'KAKAO',
        providerId: `kakao_${email.split('@')[0]}`
      }
    });

    const token = app.jwt.sign({ id: user.id, email: user.email });

    if (query?.redirect === 'true') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return reply.redirect(`${frontendUrl}?token=${token}&userId=${user.id}`);
    }

    return { 
      success: true, 
      token, 
      user: {
        ...user,
        recentWorry: null,
        feeling: null
      }
    };
  });
}
