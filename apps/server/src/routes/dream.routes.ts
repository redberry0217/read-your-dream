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
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                summary: { type: "string" },
                analysis: { type: "string" },
                tarotAnalysis: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      card: { type: "string" },
                      status: { type: "string" },
                      meaning: { type: "string" },
                      advice: { type: "string" }
                    }
                  }
                },
                ohYok: {
                  type: "object",
                  properties: {
                    food: { type: "number" },
                    wealth: { type: "number" },
                    sex: { type: "number" },
                    fame: { type: "number" },
                    sleep: { type: "number" }
                  }
                },
                chilJung: {
                  type: "object",
                  properties: {
                    joy: { type: "number" },
                    anger: { type: "number" },
                    sorrow: { type: "number" },
                    fear: { type: "number" },
                    love: { type: "number" },
                    hate: { type: "number" },
                    desire: { type: "number" }
                  }
                },
                savedLog: {
                  type: "object",
                  nullable: true,
                  properties: {
                    id: { type: "string" },
                    content: { type: "string" },
                    createdAt: { type: "string" }
                  }
                }
              }
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
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                followUpQuestions: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
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
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                id: { type: "string" },
                finalReport: { type: "string" }
              }
            }
          }
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

  // Get all logs for the authenticated user (for Garden/History)
  fastify.get("/my-logs", {
    preHandler: [fastify.authenticate],
    schema: {
      description: "Get authenticated user's dream logs (for Garden list)",
      tags: ["dream"],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  content: { type: "string" },
                  type: { type: "string" },
                  ohYok: { type: "object", nullable: true },
                  chilJung: { type: "object", nullable: true },
                  tarotCards: { type: "string", nullable: true },
                  tarotAnalysis: { type: "array", nullable: true },
                  summary: { type: "string", nullable: true },
                  analysis: { type: "string", nullable: true },
                  createdAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    try {
      const logs = await prisma.dreamLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });
      return { success: true, data: logs };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: error.message });
    }
  });

  // Get specific dream log detail
  fastify.get("/logs/:logId", {
    preHandler: [fastify.authenticate],
    schema: {
      description: "Get detailed dream log by ID",
      tags: ["dream"],
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["logId"],
        properties: {
          logId: { type: "string" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                id: { type: "string" },
                content: { type: "string" },
                type: { type: "string" },
                ohYok: { type: "object", nullable: true },
                chilJung: { type: "object", nullable: true },
                tarotCards: { type: "string", nullable: true },
                tarotAnalysis: { type: "array", nullable: true },
                summary: { type: "string", nullable: true },
                analysis: { type: "string", nullable: true },
                followUpQuestions: { type: "array", nullable: true, items: { type: "string" } },
                followUpAnswers: { type: "object", nullable: true },
                finalReport: { type: "string", nullable: true },
                createdAt: { type: "string" }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { logId } = request.params as any;
    const userId = (request.user as any).id;
    try {
      const log = await prisma.dreamLog.findUnique({
        where: { id: logId }
      });

      if (!log) {
        return reply.status(404).send({ success: false, error: "Log not found" });
      }

      if (log.userId !== userId) {
        return reply.status(403).send({ success: false, error: "Access denied" });
      }

      return { success: true, data: log };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: error.message });
    }
  });

  // Get unique tarot cards drawn by the authenticated user
  fastify.get("/my-tarots", {
    preHandler: [fastify.authenticate],
    schema: {
      description: "Get list of unique tarot cards drawn by the user",
      tags: ["dream"],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  drawnCount: { type: "number" },
                  lastDrawnAt: { type: "string" },
                  details: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      meaning: { type: "string" },
                      advice: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    try {
      const logs = await prisma.dreamLog.findMany({
        where: { 
          userId,
          tarotAnalysis: { not: null }
        },
        select: {
          tarotAnalysis: true,
          createdAt: true
        }
      });

      const uniqueCardsMap = new Map<string, any>();

      for (const log of logs) {
        if (!log.tarotAnalysis) continue;
        
        let analysisList: any[] = [];
        if (typeof log.tarotAnalysis === "string") {
          try {
            analysisList = JSON.parse(log.tarotAnalysis);
          } catch {
            continue;
          }
        } else if (Array.isArray(log.tarotAnalysis)) {
          analysisList = log.tarotAnalysis;
        }

        for (const item of analysisList) {
          if (!item || !item.card) continue;
          
          const cardName = item.card;
          if (!uniqueCardsMap.has(cardName)) {
            uniqueCardsMap.set(cardName, {
              name: cardName,
              drawnCount: 1,
              lastDrawnAt: log.createdAt,
              details: {
                status: item.status,
                meaning: item.meaning,
                advice: item.advice
              }
            });
          } else {
            const existing = uniqueCardsMap.get(cardName);
            existing.drawnCount += 1;
            if (new Date(log.createdAt) > new Date(existing.lastDrawnAt)) {
              existing.lastDrawnAt = log.createdAt;
              existing.details = {
                status: item.status,
                meaning: item.meaning,
                advice: item.advice
              };
            }
          }
        }
      }

      return { success: true, data: Array.from(uniqueCardsMap.values()) };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: error.message });
    }
  });
}
