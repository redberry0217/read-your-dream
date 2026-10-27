import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

function generateReferralCode(): string {
  return 'MJ' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

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
          name: { type: 'string' },
          referralCode: { type: 'string' }
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
    const body = request.body as { email: string; name?: string; referralCode?: string } | undefined;
    
    if (!body || !body.email) {
      return reply.status(400 as any).send({ success: false, error: 'Email is required' });
    }

    const { email, name, referralCode: inputRefCode } = body;
    const finalNickname = name || email.split('@')[0];

    const existingUser = await prisma.user.findUnique({ where: { email } });
    let referrer = null;
    if (!existingUser && inputRefCode) {
      referrer = await prisma.user.findUnique({ where: { referralCode: inputRefCode.trim().toUpperCase() } });
      if (referrer) {
        // 추천인에게 금자 3개 지급
        await prisma.user.update({
          where: { id: referrer.id },
          data: { gold: { increment: 3 } }
        });
      }
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        name, 
        nickname: finalNickname,
        // 기존 유저에 추천코드가 없다면 새로 부여
        referralCode: existingUser?.referralCode || generateReferralCode()
      },
      create: {
        email,
        name,
        nickname: finalNickname,
        silver: 50, // 신규 가입 시 기본 은자 50냥
        gold: referrer ? 4 : 1, // 추천인 가입 시 금자 3냥 추가 지급 (기본 1 + 보너스 3 = 4냥)
        jewels: 50,
        referralCode: generateReferralCode(),
        referredBy: referrer ? referrer.id : null,
        provider: 'MOCK',
        providerId: `mock_${email}`
      }
    });

    const token = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '7d' });
    
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
    const query = request.query as { email?: string; name?: string; redirect?: string; ref?: string } | undefined;
    const email = query?.email || 'google_mock@gmail.com';
    const name = query?.name || '구글몽객';
    const inputRefCode = query?.ref;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    let referrer = null;
    if (!existingUser && inputRefCode) {
      referrer = await prisma.user.findUnique({ where: { referralCode: inputRefCode.trim().toUpperCase() } });
      if (referrer) {
        await prisma.user.update({
          where: { id: referrer.id },
          data: { gold: { increment: 3 } }
        });
      }
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        name, 
        nickname: name,
        referralCode: existingUser?.referralCode || generateReferralCode()
      },
      create: {
        email,
        name,
        nickname: name,
        silver: 50,
        gold: referrer ? 4 : 1,
        jewels: 50,
        referralCode: generateReferralCode(),
        referredBy: referrer ? referrer.id : null,
        provider: 'GOOGLE',
        providerId: `google_${email.split('@')[0]}`
      }
    });

    const token = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '7d' });

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
    const query = request.query as { email?: string; name?: string; redirect?: string; ref?: string } | undefined;
    const email = query?.email || 'kakao_mock@kakao.com';
    const name = query?.name || '카카오몽객';
    const inputRefCode = query?.ref;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    let referrer = null;
    if (!existingUser && inputRefCode) {
      referrer = await prisma.user.findUnique({ where: { referralCode: inputRefCode.trim().toUpperCase() } });
      if (referrer) {
        await prisma.user.update({
          where: { id: referrer.id },
          data: { gold: { increment: 3 } }
        });
      }
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        name, 
        nickname: name,
        referralCode: existingUser?.referralCode || generateReferralCode()
      },
      create: {
        email,
        name,
        nickname: name,
        silver: 50,
        gold: referrer ? 4 : 1,
        jewels: 50,
        referralCode: generateReferralCode(),
        referredBy: referrer ? referrer.id : null,
        provider: 'KAKAO',
        providerId: `kakao_${email.split('@')[0]}`
      }
    });

    const token = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '7d' });

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
