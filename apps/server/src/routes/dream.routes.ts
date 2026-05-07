import { FastifyInstance } from "fastify";
import { DreamService } from "../services/dream.service.js";
import { prisma } from "../lib/prisma.js";
import { DreamInterpretationRequest } from "@mjdr/shared-types";

export async function dreamRoutes(fastify: FastifyInstance) {
  fastify.post("/interpret", {
    // Optional authentication: use it if token is provided
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        // Continue even if not authenticated
      }
    },
    schema: {
      description: "Step 1: Basic dream interpretation (FREE)",
      tags: ["dream"],
      body: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string" },
          userId: { type: "string" }, // Fallback for testing without token
          userStatus: {
            type: "object",
            properties: {
              recentWorry: { type: "string" },
              feeling: { type: "string" }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { content, userId: bodyUserId, userStatus } = request.body as any;
    const authenticatedUser = request.user as any;
    const finalUserId = authenticatedUser?.id || bodyUserId;

    try {
      if (finalUserId) {
        await prisma.user.upsert({
          where: { id: finalUserId },
          update: {},
          create: {
            id: finalUserId,
            email: authenticatedUser?.email || `${finalUserId}@example.com`,
            jewels: 50,
          }
        });
      }

      const result = await DreamService.interpretDream(content, userStatus);
      
      let savedLog = null;
      if (finalUserId) {
        savedLog = await prisma.dreamLog.create({
          data: {
            content,
            type: "FREE",
            ohYok: result.ohYok || {},
            chilJung: result.chilJung || {},
            tarotAnalysis: result.tarotAnalysis || null,
            summary: result.summary || null,
            analysis: result.analysis || null,
            userId: finalUserId
          }
        });
      }

      return { 
        success: true, 
        data: {
          ...result,
          savedLog
        } 
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: error.message });
    }
  });

  // Step 2: Start Deep Analysis (PREMIUM - 10 Jewels)
  fastify.post("/start-deep-analysis", {
    preHandler: [fastify.authenticate],
    schema: {
      description: "Step 2: Generate follow-up questions (PREMIUM - 10 Jewels)",
      tags: ["dream"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["logId"],
        properties: {
          logId: { type: "string" }
        }
      }
    }
  }, async (request, reply) => {
    const { logId } = request.body as any;
    const authenticatedUserId = (request.user as any).id;

    try {
      const log = await prisma.dreamLog.findUnique({
        where: { id: logId },
        include: { user: true }
      });

      if (!log) return reply.status(404).send({ success: false, error: "Log not found" });

      // Ownership check
      if (log.userId !== authenticatedUserId) {
        return reply.status(403).send({ success: false, error: "This log does not belong to you" });
      }

      // Check & Deduct Jewels (10)
      const currentUser = await prisma.user.findUnique({ where: { id: authenticatedUserId } });
      const currentJewels = currentUser?.jewels || 0;

      if (currentJewels < 10) {
        return reply.status(403).send({ 
          success: false, 
          error: `Insufficient jewels (10 required. Current: ${currentJewels})` 
        });
      }

      await prisma.user.update({
        where: { id: authenticatedUserId },
        data: { jewels: { decrement: 10 } }
      });

      const questions = await DreamService.generateFollowUpQuestions(log.content, log.analysis || "");

      const updatedLog = await prisma.dreamLog.update({
        where: { id: logId },
        data: {
          type: "PREMIUM",
          followUpQuestions: questions
        }
      });

      return { success: true, data: updatedLog };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: error.message });
    }
  });

  // Step 3: Consolidate Final Analysis (FREE after Step 2)
  fastify.post("/consolidate", {
    preHandler: [fastify.authenticate],
    schema: {
      description: "Step 3: Complete deep analysis with user answers",
      tags: ["dream"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["logId", "answers"],
        properties: {
          logId: { type: "string" },
          answers: { type: "object", additionalProperties: true }
        }
      }
    }
  }, async (request, reply) => {
    const { logId, answers } = request.body as any;
    const authenticatedUserId = (request.user as any).id;

    try {
      const log = await prisma.dreamLog.findUnique({
        where: { id: logId }
      });

      if (!log) return reply.status(404).send({ success: false, error: "Log not found" });

      // Ownership check
      if (log.userId !== authenticatedUserId) {
        return reply.status(403).send({ success: false, error: "This log does not belong to you" });
      }

      const finalResult = await DreamService.consolidatedAnalysis(
        log.content,
        { tarotAnalysis: log.tarotAnalysis },
        answers
      );

      const updatedLog = await prisma.dreamLog.update({
        where: { id: logId },
        data: {
          followUpAnswers: answers,
          finalReport: finalResult.finalReport
        }
      });

      return { success: true, data: updatedLog };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: error.message });
    }
  });

  fastify.get("/logs/:userId", {
    schema: {
      description: "Get dream logs for a user",
      tags: ["dream"],
      params: {
        type: "object",
        properties: {
          userId: { type: "string" }
        }
      }
    }
  }, async (request, reply) => {
    const { userId } = request.params as any;
    const logs = await prisma.dreamLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: logs };
  });
}
