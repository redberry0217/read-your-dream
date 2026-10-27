import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

function isSameDay(date1?: Date | null, date2: Date = new Date()): boolean {
  if (!date1) return false;
  return date1.toISOString().slice(0, 10) === date2.toISOString().slice(0, 10);
}

function generateReferralCode(): string {
  return 'MJ' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

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
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { status: true }
    });
    
    if (!user) {
      throw app.httpErrors.notFound('User not found');
    }

    if (!user.referralCode) {
      const code = generateReferralCode();
      user = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        include: { status: true }
      });
    }
    
    const { status, ...rest } = user;
    return {
      ...rest,
      silver: user.silver ?? 50,
      gold: user.gold ?? 1,
      jewels: user.silver ?? 50,
      referralCode: user.referralCode,
      lastAttendance: user.lastAttendance?.toISOString() || null,
      nickname: user.nickname || user.name || '',
      recentWorry: status?.recentWorry || null,
      feeling: status?.feeling || null
    };
  });

  // Daily attendance check-in (+20 은자)
  app.post('/attendance', {
    preHandler: [app.authenticate],
    schema: {
      description: 'Daily attendance check-in (+20 은자)',
      tags: ['user'],
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw app.httpErrors.notFound('User not found');

    if (isSameDay(user.lastAttendance)) {
      return reply.status(400 as any).send({
        success: false,
        message: '오늘의 출석 보상(은자 20냥)을 이미 수령하였소. 내일 다시 오시오.'
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        silver: { increment: 20 },
        jewels: { increment: 20 },
        lastAttendance: new Date()
      }
    });

    return {
      success: true,
      reward: 20,
      silver: updated.silver,
      gold: updated.gold,
      message: '출석을 완료하여 은자 20냥을 얻었소!'
    };
  });

  // Share with friend (+10 은자)
  app.post('/share', {
    preHandler: [app.authenticate],
    schema: {
      description: 'Share with friend (+10 은자)',
      tags: ['user'],
      security: [{ bearerAuth: [] }]
    }
  }, async (request) => {
    const userId = (request.user as any).id;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        silver: { increment: 10 },
        jewels: { increment: 10 }
      }
    });

    return {
      success: true,
      reward: 10,
      silver: updated.silver,
      gold: updated.gold,
      message: '도반에게 몽중다로를 공유하여 은자 10냥을 얻었소!'
    };
  });

  // Exchange 100 은자 -> 1 금자
  app.post('/exchange', {
    preHandler: [app.authenticate],
    schema: {
      description: 'Exchange 100 은자 to 1 금자',
      tags: ['user'],
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw app.httpErrors.notFound('User not found');

    if (user.silver < 100) {
      return reply.status(400 as any).send({
        success: false,
        message: `은자가 부족하오. 최소 100냥이 필요하나 현재 ${user.silver}냥을 보유 중이오.`
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        silver: { decrement: 100 },
        jewels: { decrement: 100 },
        gold: { increment: 1 }
      }
    });

    return {
      success: true,
      silver: updated.silver,
      gold: updated.gold,
      message: '은자 100냥을 금자 1냥으로 환전하였소!'
    };
  });

  // Charge silver or gold (Mock/Test API)
  app.post('/charge', {
    preHandler: [app.authenticate],
    schema: {
      description: 'Charge silver or gold (Mock for testing)',
      tags: ['user'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', minimum: 1 },
          currency: { type: 'string', enum: ['silver', 'gold'] }
        }
      }
    }
  }, async (request, reply) => {
    const body = request.body as { amount: number; currency?: 'silver' | 'gold' } | undefined;
    const userId = (request.user as any).id;

    if (!body || !body.amount || body.amount <= 0) {
      return reply.status(400 as any).send({ success: false, error: 'Invalid amount' });
    }

    const { amount, currency = 'silver' } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: currency === 'gold' 
        ? { gold: { increment: amount } }
        : { silver: { increment: amount }, jewels: { increment: amount } }
    });

    return {
      success: true,
      silver: updatedUser.silver,
      gold: updatedUser.gold,
      jewels: updatedUser.silver,
      message: `${amount} ${currency === 'gold' ? '금자' : '은자'} 충전 완료 (테스트).`
    };
  });

  // Update user current status (Worry and Feeling) (+10 은자 기록 보상)
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
      }
    }
  }, async (request) => {
    const userId = (request.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const body = request.body as { recentWorry?: string | null; feeling?: string | null } | undefined;

    const recentWorry = body?.recentWorry ?? null;
    const feeling = body?.feeling ?? null;

    const status = await prisma.userStatus.upsert({
      where: { userId },
      update: { recentWorry, feeling },
      create: { userId, recentWorry, feeling }
    });

    // 하루 1회 감정/기분/일기 기록 시 은자 10냥 보상 지급
    let earnedSilver = false;
    if (user && !isSameDay(user.lastRecordedAt)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          silver: { increment: 10 },
          jewels: { increment: 10 },
          lastRecordedAt: new Date()
        }
      });
      earnedSilver = true;
    }

    return {
      success: true,
      earnedSilver,
      message: earnedSilver ? '마음을 기록하여 은자 10냥을 얻었소.' : '마음 상태가 기록되었소.',
      data: {
        recentWorry: status.recentWorry,
        feeling: status.feeling
      }
    };
  });
}
