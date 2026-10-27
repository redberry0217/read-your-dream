import { generateWithFallback } from "../lib/gemini.js";
import { prisma } from "../lib/prisma.js";

export class DreamService {
  private static buildDynamicInterpretation(
    content: string,
    selectedCards: any[],
    userStatus?: { recentWorry?: string | null; feeling?: string | null }
  ) {
    const card1 = selectedCards[0];
    const card2 = selectedCards[1];
    const card3 = selectedCards[2];
    const cleanSnippet = content.trim().replace(/\s+/g, " ").slice(0, 40);

    return {
      summary: `"${cleanSnippet}" 꿈속에 드리운 징조는 ${card1.name}과 ${card3.name}의 기운이 교차하며 현실의 결단을 촉구하고 있소.`,
      analysis: `그대가 들려준 꿈("${cleanSnippet}...")의 결을 가만히 짚어보건대, 마음속 깊은 곳에서 일렁이는 파동이 세 장의 패로 고스란히 투영되었소.\n\n먼저 제 1패인 [${card1.name}](${card1.isReversed ? '역방향' : '정방향'})은 그대가 지나온 길에서 비롯된 내면의 원인(${card1.keywords})을 가리키며, 제 2패인 [${card2.name}](${card2.isReversed ? '역방향' : '정방향'})은 당면한 현실의 갈등과 회피 중인 문제(${card2.baseMeaning.slice(0, 50)}...)를 비추고 있소.\n\n${userStatus?.recentWorry ? `특히 그대가 토로한 "${userStatus.recentWorry}"라는 번민과 맞물려, ` : ""}마지막 제 3패 [${card3.name}]은 앞으로 나아가야 할 단호한 처방을 내리고 있소. 막연한 기대나 관념에 기대지 말고, 오늘 당장 발밑의 현실적인 과제부터 직시하고 매듭지으시오.`,
      tarotAnalysis: selectedCards.map((c: any) => ({
        position: c.position,
        card: c.name,
        status: c.isReversed ? "역방향" : "정방향",
        meaning: c.baseMeaning,
        advice: c.practicalAdvice || (c.isReversed ? "자신의 나쁜 버릇을 합리화하지 말고 즉시 고치시오." : "마음속 품은 결단을 오늘 당장 행동으로 옮기시오.")
      })),
      ohYok: { food: 20, wealth: 40, sex: 15, fame: 55, sleep: 30 },
      chilJung: { joy: 20, anger: 15, sorrow: 25, fear: 35, love: 20, hate: 10, desire: 45 },
      emotionReasons: {
        dominantDesire: `명예와 성취에 대한 갈망이 높은 것은 꿈속에서 드러난 상황을 통제하고 인정받고자 하는 무의식의 욕구가 강하게 작용한 까닭이오.`,
        dominantEmotion: `두려움(35)과 열망(45)이 함께 교차하는 것은 변화를 갈망하면서도 익숙한 궤도를 벗어나는 것에 대한 불안감이 공존하기 때문이로다.`
      }
    };
  }

  static async interpretDream(
    content: string,
    type: "FREE" | "PREMIUM",
    userStatus?: { recentWorry?: string | null; feeling?: string | null }
  ) {
    // 1. [백엔드 로직] 타로 카드 선출 및 DB 메타데이터 조회 프로세스
    // 78장의 카드 중 무작위 3장 드로우
    const drawCards = () => {
      const cardIds = new Set<number>();
      while (cardIds.size < 3) {
        cardIds.add(Math.floor(Math.random() * 78));
      }
      return Array.from(cardIds);
    };
    const selectedIds = drawCards();

    const tarotCardsFromDB = await prisma.tarotCard.findMany({
      where: { id: { in: selectedIds } }
    });

    const SPREAD_ROLES = [
      { role: "제 1패", desc: "과거와 원인 — 무의식 속에 숨겨진 배경과 이 꿈을 잉태한 내면의 계기" },
      { role: "제 2패", desc: "현재와 장애물 — 유저가 당면하고 있거나 회피 중인 현실의 갈등과 징조" },
      { role: "제 3패", desc: "미래와 처방 — 앞으로 닥칠 흐름과 오늘 당장 실행해야 할 현실적 행동 지침" }
    ];

    const selectedCards = tarotCardsFromDB.map((card, idx) => {
      const isReversed = Math.random() > 0.5;
      const spreadRole = SPREAD_ROLES[idx] || { role: `제 ${idx + 1}패`, desc: "운명의 징조" };
      return {
        id: card.id,
        name: card.name,
        position: spreadRole.role,
        positionDesc: spreadRole.desc,
        isReversed,
        baseMeaning: isReversed ? card.meaningReversed : card.meaningUpright,
        keywords: isReversed ? card.keywordsRev : card.keywords,
        practicalAdvice: card.practicalAdvice,
        orientalVibe: card.orientalVibe
      };
    });

    const tarotCardsContext = selectedCards.map((c) => 
      `[${c.position}]
- 패 명칭: ${c.name} (${c.isReversed ? '역방향 (엄격한 지적 대상)' : '정방향'})
- 부여된 역할: ${c.positionDesc}
- 핵심 징조 키워드: ${c.keywords}
- 카드의 본래 뜻: ${c.baseMeaning}
- 동양 사주/오행적 비유: ${c.orientalVibe || '없음'}
- 현실 조언 지침: ${c.practicalAdvice || '없음'}`
    ).join("\n\n");

    const dynamicTierRules = type === "FREE" 
      ? `- Mode (FREE): 사용자의 꿈속 핵심 상징물과 3장의 카드를 융합하여 기품 있고 날카로운 문체로 3~4문단 이내로 명확하게 통찰하시오. 오욕칠정 수치 12가지 항목을 정밀하게 채점하시오.`
      : `- Mode (PREMIUM): 꿈과 타로, 그리고 심리 컨텍스트를 복합적으로 엮어 1,500자 이상의 장문으로 '심층 심리 분석 리포트'와 현실에서 오늘 당장 실천할 수 있는 구체적인 행동 가이드(동사 중심 명령형)를 내리시오. 오욕칠정 수치 12가지 항목을 정밀하게 채점하시오.`;

    const evaluationCriteria = `
      [오욕칠정(五欲七情) 채점 기준표 (0~100 사이의 정수)]
      1. 오욕(五欲): 유저의 결핍과 욕망 분석
        - food: 식욕 (음식, 잔치, 먹는 행위 -> 생존 및 본능적 만족도)
        - wealth: 재욕 (돈, 보석, 쟁취, 무언가를 약탈당하거나 얻는 꿈 -> 성취 및 소유욕)
        - sex: 색욕 (이성, 신체 접촉, 아름답거나 매혹적인 오브젝트 -> 애정 및 관계 결핍)
        - fame: 명예욕 (높은 곳에 오름, 인정받음, 꾸짖음을 들음 -> 자아존중감 및 인정 욕구)
        - sleep: 수면욕 (휴식, 아늑한 집, 평화로운 풍경 -> 현실 도피 및 안정욕)
      2. 칠정(七情): 유저의 현재 감정 상태 변동폭
        - joy: 희(喜) (환희와 기쁨, 밝은 빛, 성취)
        - anger: 노(怒) (분노와 억울함, 싸움, 저항)
        - sorrow: 애(哀) (비애와 슬픔, 상실, 눈물, 이별)
        - fear: 구(懼) (경외와 공포, 거대 존재 마주함, 압도당함)
        - love: 애(愛) (애착과 그리움, 따뜻한 인물, 보호)
        - hate: 오(惡) (거부와 미움, 혐오스러운 대상, 불쾌함)
        - desire: 욕(欲) (열망과 탐욕, 무언가를 강렬히 찾거나 짐을 싸는 행위)
    `;

    const prompt = `
      ${dynamicTierRules}
      ${evaluationCriteria}
      
      [주입된 운명의 3패 (스프레드 시간축/심리축)]
      ${tarotCardsContext}

      [사용자 입력 데이터]
      - 사용자의 꿈 일기: "${content}"
      - 사용자의 최근 고민: "${userStatus?.recentWorry || "없음"}"
      - 사용자의 현재 기분: "${userStatus?.feeling || "없음"}"

      [작업 지시]
      1. [미사여구 및 뜬구름 소리 일절 금지]: '천지의 기운', '신선의 숨결', '음양의 조화' 같은 공허한 수식어는 단 한마디도 쓰지 마시오.
      2. [꿈 상징 핀포인트 현실 직결]: 유저의 꿈속 구체적 행동과 사물 2~3개를 짚어내고, 이것이 현대인의 실제 심리(타인의 시선 의식, 거절에 대한 공포, 실패가 두려워 미루는 나태함, 현실 도피)와 어떻게 맞닿아 있는지 담백하고 날카롭게 직설하시오.
      3. [3패 스토리텔링 유기적 융합]: 제 1패(과거/원인) ➡️ 제 2패(현재/장애물) ➡️ 제 3패(미래/처방)의 순서대로, 과거의 결핍이 현재 어떤 왜곡된 행동을 낳았고 미래에 어떤 결단을 내려야 하는지 하나의 인과 서사로 엮으시오.
      4. [역방향 엄격성]: 역방향 카드가 나온 자리에서는 타협 없이 유저의 나쁜 버릇과 비겁한 자기기만을 서늘하게 지적하시오.
      5. [오욕칠정 채점 및 이유]: 12가지 항목을 객관적으로 채점(0~100)하고, 가장 점수가 높은 주된 욕망과 감정에 대해 '이 점수가 나온 꿈속 구체적 근거'를 emotionReasons에 1문장씩 밝히시오.
      6. [외래어 및 영단어 일절 금지]: 영단어는 본문과 카드명에서 절대로 쓰지 마시오. 타로 4대 원소는 지팡이, 잔, 검, 엽전만을 사용하시오.
      7. 지정된 JSON 규격을 절대로 어기지 말고, 순수한 JSON 문자열 객체만을 출력하시오.

      [출력 형식 (정밀 JSON)]
      {
        "summary": "뜬구름 잡지 않고 뼈를 때리는 단호하고 서늘한 한 줄 요약 점사 (외래어 절대 금지)",
        "analysis": "공허한 미사여구 없이 꿈속 상징과 3패의 인과를 현실 심리와 1:1로 맞물려 서술한 담백하고 날카로운 본문",
        "tarotAnalysis": [
          {
            "position": "제 1패",
            "card": "0. 바보",
            "status": "역방향",
            "meaning": "카드의 상징이 유저의 꿈속 행동 및 내면 결핍과 결합된 군더더기 없는 해설",
            "advice": "오늘 당장 실천할 수 있는 구체적인 동사 중심의 행동 조언 1문장"
          }
        ],
        "ohYok": { "food": 0, "wealth": 0, "sex": 0, "fame": 0, "sleep": 0 },
        "chilJung": { "joy": 0, "anger": 0, "sorrow": 0, "fear": 0, "love": 0, "hate": 0, "desire": 0 },
        "emotionReasons": {
          "dominantDesire": "이 욕망이 가장 높게 산출된 꿈속 행동/상징적 이유 1문장",
          "dominantEmotion": "이 감정이 가장 요동친 심리적 원인 1문장"
        }
      }
    `;

    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY not configured. Generating dynamic card-based mock interpretation.");
      return this.buildDynamicInterpretation(content, selectedCards, userStatus);
    }

    try {
      const responseText = await generateWithFallback(prompt, true);
      let parsed: any;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Failed to parse AI response as JSON");
        parsed = JSON.parse(jsonMatch[0]);
      }

      // 카드 이름이 영문으로 반환되지 않도록 DB의 순수 한글 명칭으로 보정
      if (Array.isArray(parsed.tarotAnalysis)) {
        parsed.tarotAnalysis = parsed.tarotAnalysis.map((item: any, idx: number) => ({
          ...item,
          card: selectedCards[idx]?.name || item.card
        }));
      }

      return parsed;
    } catch (err: any) {
      console.error("⚠️ All Gemini AI models failed or rate-limited. Falling back to dynamic interpretation:", err.message);
      return this.buildDynamicInterpretation(content, selectedCards, userStatus);
    }
  }

  static async generateFollowUpQuestions(initialDream: string, analysis: string) {
    const prompt = `
      너는 16세기 조선의 영험한 역술가이자 심리학자이다.
      아래의 꿈 내용과 이전에 수행한 가벼운 1차 분석을 토대로, 사용자가 애써 외면하고 있는 무의식의 가장 깊은 진실(허점)을 날카롭게 찌르기 위한 '심층 질문' 3개를 생성하시오.
      
      사용자의 꿈: "${initialDream}"
      1차 분석 요약: "${analysis}"

      [작업 지시]
      - 뜬구름 잡는 소리, 공허한 철학적 비유, 미사여구는 일절 금지한다.
      - 질문은 "어제 몇 시에 잤나요?" 같은 일상 질문이나 "우주의 흐름을 보았소?" 같은 허황된 질문이 아니어야 합니다.
      - "그토록 도망치면서도 끝내 손에 쥔 보따리를 내려놓지 못한 것은, 현실에서 버려야 할 관계를 미련하게 붙들고 있다는 증거 아니오?", "타인의 비난이 두려워 가면 뒤로 숨어버린 그대의 비겁함을 언제까지 정당화할 셈이오?"처럼 유저의 심리적 허를 찌르고 현실의 위선을 직면시키는 날카로운 유도 질문이어야 합니다.
      - 담백하고 서늘한 조선 도사의 말투(~이오?, ~소?)를 유지하십시오.
      - 결과는 JSON 마크다운 형식을 제외하고 오직 하단의 JSON Array 규격으로만 출력하시오.

      [출력 형식]
      ["질문1", "질문2", "질문3"]
    `;

    const fallbackQuestions = [
      "1. 꿈속에서 마주한 그 순간, 두려움이 앞섰소 아니면 벗어나고픈 열망이 앞섰소?",
      "2. 그대가 현실에서 차마 입 밖으로 내지 못하고 삼켜버린 가장 은밀한 불안은 무엇이오?",
      "3. 만약 오늘 밤 당장 한 가지 짐을 내려놓을 수 있다면, 그대는 무엇을 가장 먼저 버리겠소?"
    ];

    if (!process.env.GEMINI_API_KEY) {
      return fallbackQuestions;
    }

    try {
      // 9초 이내 응답 없을 시 즉시 도사 기본 질문으로 대체 (타임아웃 방어)
      const aiPromise = generateWithFallback(prompt, true);
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API timeout (9s exceeded)")), 9000)
      );
      const responseText = await Promise.race([aiPromise, timeoutPromise]);

      try {
        return JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("Failed to parse AI response as JSON Array");
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err: any) {
      console.warn("⚠️ Fallback questions served due to AI delay or error:", err.message);
      return fallbackQuestions;
    }
  }

  static async consolidatedAnalysis(initialDream: string, tarotInfo: any, answers: any) {
    const prompt = `
      당신은 16세기 조선의 영험한 역술가이자 무의식을 조율하는 심리학자입니다.
      사용자의 초기 꿈, 앞서 뽑힌 타로 카드의 점괘, 그리고 사용자가 도사의 날카로운 질문에 대해 고해성사하듯 답한 '심층 답변'을 모두 집대성하여 최종적인 인생의 '대단원(Finale) 리포트'를 작성하십시오.

      초기 꿈: "${initialDream}"
      선택된 타로 패 정보: ${JSON.stringify(tarotInfo)}
      사용자의 심층 고해 답변: ${JSON.stringify(answers)}

      [작업 지시]
      - 뜬구름 잡는 소리, 공허한 신선놀음 비유, 시적 미사여구는 전면 배제하시오.
      - 분량 분배: 꿈 서사 분석(20%) : 타로 징조 해석(20%) : 사용자의 내면 심리 대조 및 통찰(60%)의 비율로 아주 상세하고 묵직하게 서술하십시오.
      - 답변 분석: 사용자가 적은 답변의 행간에 숨겨진 불안, 회피, 열망의 단서를 찾아내어 타로 카드가 경고한 바와 정교하게 엮어내시오.
      - 현실적 처방전: 리포트 가장 마지막 문단에는 "마음을 편히 가지시오" 같은 정적인 조언을 절대 금하고, "오늘 당장 묵혀둔 장부를 정리하시오", "미련 남은 그 인연의 서신을 불태우시오"와 같이 당장 실행 가능한 '동사 중심의 엄격하고 구체적인 현실적 처방전'을 하달하며 마무리하시오.

      출력은 미사여구 없이 담백하면서도 서늘할 정도로 날카로운 조선 시대 도사의 말투를 유지하고, 마크다운 가독성을 살려 작성하시오.
    `;

    const fallbackReport = {
      finalReport: `### 📜 몽중다로(夢中茶路) 대단원 심층 처방전\n\n**"허상을 걷어내고 현실의 결단을 내리시오"**\n\n그대가 고백한 속마음과 앞서 도출된 세 장의 타로 패를 종합해 보건대, 그대의 내면은 오랜 갈등의 변곡점에 서 있소.\n\n#### 1. 꿈의 징조와 무의식의 메아리\n꿈속에 드리운 징조는 그대가 더 이상 과거의 방식으로는 버틸 수 없음을 엄중히 알리고 있소. 마음속으로 이미 답을 알고 있으면서도 결정을 미루는 까닭은 실은 실패에 대한 두려움 때문이 아니오.\n\n#### 2. 도사의 현실적 처방\n- **오늘 당장 해야 할 일:** 그대를 옭아매고 있는 미련한 관계나 불필요한 결정을 더 이상 내일로 미루지 마시오.\n- **마음가짐:** 뻔한 위로는 독이 될 뿐이오. 스스로에게 솔직해지는 것만이 유일한 타개책이로다.`
    };

    if (!process.env.GEMINI_API_KEY) {
      return fallbackReport;
    }

    try {
      const aiPromise = generateWithFallback(prompt, false);
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API timeout (12s exceeded)")), 12000)
      );
      const responseText = await Promise.race([aiPromise, timeoutPromise]);
      return { finalReport: responseText };
    } catch (err: any) {
      console.warn("⚠️ Fallback final report due to AI delay or error:", err.message);
      return fallbackReport;
    }
  }
}
