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
          recentWorry: { type: "string" },
          feeling: { type: "string" },
          worryTags: { type: "array", items: { type: "string" } },
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
                dreamContent: { type: "string" },
                summary: { type: "string" },
                analysis: { type: "string" },
                tarotAnalysis: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      position: { type: "string" },
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
                emotionReasons: {
                  type: "object",
                  properties: {
                    dominantDesire: { type: "string" },
                    dominantEmotion: { type: "string" }
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
    const { 
      content, 
      userId: bodyUserId, 
      recentWorry: bodyWorry, 
      feeling: bodyFeeling, 
      worryTags, 
      userStatus: bodyStatus 
    } = request.body as any;
    const authenticatedUser = request.user as any;
    const finalUserId = authenticatedUser?.id || bodyUserId;

    try {
      let activeUserStatus: { recentWorry?: string; feeling?: string } | undefined = undefined;

      // 태그나 바디에서 직접 전달된 고민/감정 추출 (배열인 경우 콤마로 결합)
      const directWorry = bodyWorry || bodyStatus?.recentWorry || (Array.isArray(worryTags) && worryTags.length > 0 ? worryTags.join(', ') : undefined);
      const directFeeling = bodyFeeling || bodyStatus?.feeling || undefined;

      if (finalUserId) {
        // Ensure user exists
        await prisma.user.upsert({
          where: { id: finalUserId },
          update: {},
          create: {
            id: finalUserId,
            email: authenticatedUser?.email || `${finalUserId}@example.com`,
            jewels: 50,
          }
        });

        // 사용자가 이번 요청에 태그/고민을 전달했다면 DB UserStatus에도 즉시 갱신
        if (directWorry || directFeeling) {
          await prisma.userStatus.upsert({
            where: { userId: finalUserId },
            update: {
              ...(directWorry ? { recentWorry: directWorry } : {}),
              ...(directFeeling ? { feeling: directFeeling } : {})
            },
            create: {
              userId: finalUserId,
              recentWorry: directWorry || null,
              feeling: directFeeling || null
            }
          });
        }

        // DB에서 최신 유저 상태 로드
        const dbStatus = await prisma.userStatus.findUnique({
          where: { userId: finalUserId }
        });
        if (dbStatus) {
          activeUserStatus = {
            recentWorry: dbStatus.recentWorry || directWorry || undefined,
            feeling: dbStatus.feeling || directFeeling || undefined
          };
        }
      } else if (directWorry || directFeeling) {
        // 비로그인 게스트도 이번 해몽에 전달된 고민/감정 태그 반영
        activeUserStatus = {
          recentWorry: directWorry,
          feeling: directFeeling
        };
      }

      const result = await DreamService.interpretDream(content, "FREE", activeUserStatus);
      
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

        // 꿈 기록 보상: 은자 10냥 적립
        const loggedUser = await prisma.user.findUnique({ where: { id: finalUserId } });
        if (loggedUser && (!loggedUser.lastRecordedAt || loggedUser.lastRecordedAt.toISOString().slice(0, 10) !== new Date().toISOString().slice(0, 10))) {
          await prisma.user.update({
            where: { id: finalUserId },
            data: {
              silver: { increment: 10 },
              jewels: { increment: 10 },
              lastRecordedAt: new Date()
            }
          });
        }
      }

      return { 
        success: true, 
        data: {
          dreamContent: content,
          ...result,
          savedLog
        } 
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500 as any).send({ success: false, error: error.message });
    }
  });

  // Save a dream interpretation generated while unauthenticated (Guest -> User sync)
  fastify.post("/save-guest-log", {
    preHandler: [fastify.authenticate],
    schema: {
      description: "Save dream interpretation result generated while unauthenticated",
      tags: ["dream"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string" },
          summary: { type: "string", nullable: true },
          analysis: { type: "string", nullable: true },
          tarotAnalysis: { type: "array", nullable: true },
          ohYok: { type: "object", nullable: true },
          chilJung: { type: "object", nullable: true }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { $ref: "DreamLog#" }
          }
        }
      }
    }
  }, async (request, reply) => {
    const authenticatedUserId = (request.user as any).id;
    const body = request.body as any;

    try {
      const savedLog = await prisma.dreamLog.create({
        data: {
          content: body.content,
          type: "FREE",
          summary: body.summary || null,
          analysis: body.analysis || null,
          tarotAnalysis: body.tarotAnalysis || null,
          ohYok: body.ohYok || {},
          chilJung: body.chilJung || {},
          userId: authenticatedUserId
        }
      });

      return { success: true, data: savedLog };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500 as any).send({ success: false, error: error.message });
    }
  });

  // Step 2: Start Deep Analysis (PREMIUM - 테스트 기간 인증 및 은자 소모 생략)
  fastify.post("/start-deep-analysis", {
    schema: {
      description: "Step 2: Generate follow-up questions (Testing mode: free & optional auth)",
      tags: ["dream"],
      body: {
        type: "object",
        properties: {
          logId: { type: "string" },
          dreamContent: { type: "string" },
          analysis: { type: "string" }
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
    const { logId, dreamContent, analysis } = request.body as any || {};

    try {
      let targetContent = dreamContent || "";
      let targetAnalysis = analysis || "";
      let updatedLog: any = null;

      let existingLog: any = null;
      if (logId) {
        existingLog = await prisma.dreamLog.findUnique({
          where: { id: logId }
        });
        if (existingLog) {
          targetContent = targetContent || existingLog.content;
          targetAnalysis = targetAnalysis || (existingLog.analysis || "");
        }
      }

      // 1. AI 질문 생성 수행 (타임아웃 및 모델 에러 자동 대체)
      const questions = await DreamService.generateFollowUpQuestions(
        targetContent || "나의 어젯밤 꿈",
        targetAnalysis || "무의식의 징조"
      );

      // 2. 로그가 실제로 존재할 때만 갱신 (테스트 중 은자 차감 생략)
      if (existingLog) {
        try {
          updatedLog = await prisma.dreamLog.update({
            where: { id: logId },
            data: {
              type: "PREMIUM",
              followUpQuestions: questions
            }
          });
        } catch (e) {
          console.warn("Log update skipped:", e);
        }
      }

      return { 
        success: true, 
        data: {
          id: updatedLog?.id || logId || "test-log-id",
          type: "PREMIUM",
          followUpQuestions: questions
        } 
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500 as any).send({ success: false, error: error.message });
    }
  });

  // Step 3: Consolidate Final Analysis (테스트 기간 인증 생략)
  fastify.post("/consolidate", {
    schema: {
      description: "Step 3: Complete deep analysis with user answers",
      tags: ["dream"],
      body: {
        type: "object",
        required: ["answers"],
        properties: {
          logId: { type: "string" },
          answers: { type: "object", additionalProperties: true },
          dreamContent: { type: "string" },
          tarotAnalysis: { type: "array" }
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
    const { logId, answers, dreamContent, tarotAnalysis } = request.body as any || {};

    try {
      let targetContent = dreamContent || "";
      let targetTarot = tarotAnalysis || null;

      if (logId) {
        const log = await prisma.dreamLog.findUnique({
          where: { id: logId }
        });
        if (log) {
          targetContent = targetContent || log.content;
          targetTarot = targetTarot || log.tarotAnalysis;
        }
      }

      const finalResult = await DreamService.consolidatedAnalysis(
        targetContent || "나의 꿈",
        { tarotAnalysis: targetTarot },
        answers || {}
      );

      if (logId) {
        try {
          await prisma.dreamLog.update({
            where: { id: logId },
            data: {
              followUpAnswers: answers,
              finalReport: finalResult.finalReport
            }
          });
        } catch (e) {
          console.warn("Log update skipped:", e);
        }
      }

      return {
        success: true,
        data: {
          id: logId || "test-log-id",
          finalReport: finalResult.finalReport
        }
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500 as any).send({ success: false, error: error.message });
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
              items: { $ref: "DreamLog#" }
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
      return reply.status(500 as any).send({ success: false, error: error.message });
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
            data: { $ref: "DreamLog#" }
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
        return reply.status(404 as any).send({ success: false, error: "Log not found" });
      }

      if (log.userId !== userId) {
        return reply.status(403 as any).send({ success: false, error: "Access denied" });
      }

      return { success: true, data: log };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500 as any).send({ success: false, error: error.message });
    }
  });

  // Delete a dream log by ID
  fastify.delete("/logs/:logId", {
    preHandler: [fastify.authenticate],
    schema: {
      description: "Delete a dream log by ID",
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
            message: { type: "string" }
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
        return reply.status(404 as any).send({ success: false, error: "Log not found" });
      }

      if (log.userId !== userId) {
        return reply.status(403 as any).send({ success: false, error: "Access denied" });
      }

      await prisma.dreamLog.delete({
        where: { id: logId }
      });

      return { success: true, message: "Dream log deleted successfully" };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500 as any).send({ success: false, error: error.message });
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
              items: { $ref: "TarotCardDrawn#" }
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
          tarotAnalysis: { not: null as any }
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
      return reply.status(500 as any).send({ success: false, error: error.message });
    }
  });
}
