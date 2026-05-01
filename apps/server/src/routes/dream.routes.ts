import { FastifyInstance } from "fastify";
import { DreamService } from "../services/dream.service.js";
import { prisma } from "../lib/prisma.js";
import { DreamInterpretationRequest } from "@mjdr/shared-types";

export async function dreamRoutes(fastify: FastifyInstance) {
  fastify.post("/interpret", {
    schema: {
      description: "Interpret a dream using Gemini AI",
      tags: ["dream"],
      body: {
        type: "object",
        required: ["content", "type"],
        properties: {
          content: { type: "string" },
          type: { type: "string", enum: ["FREE", "PREMIUM"] },
          userId: { type: "string" },
          userStatus: {
            type: "object",
            properties: {
              recentWorry: { type: "string" },
              feeling: { type: "string" }
            }
          }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "object", additionalProperties: true }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { content, type, userId, userStatus } = request.body as any;

    try {
      const result = await DreamService.interpretDream(content, type, userStatus);
      
      // Default emotions if not provided by AI (though it should)
      const defaultEmotions = {
        joy: 0, anger: 0, sadness: 0, fear: 0, love: 0, disgust: 0, desire: 0
      };

      // Save to database if userId is provided
      let savedLog = null;
      if (userId) {
        // Ensure user exists for testing (In production, user should already exist)
        await prisma.user.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            email: `${userId}@example.com`,
          }
        });

        savedLog = await prisma.dreamLog.create({
          data: {
            content,
            type,
            emotions: result.emotions || defaultEmotions,
            tarotCards: result.tarotCards ? JSON.stringify(result.tarotCards) : null,
            summary: result.summary || null,
            analysis: result.analysis || null,
            userId: userId
          }
        });
      }

      return { 
        success: true, 
        data: {
          ...result,
          id: savedLog?.id
        } 
      };
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
