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

    const isShortInput = content.trim().length < 10;
    const summary = isShortInput
      ? "흐릿한 꿈의 잔상 너머로, 그대의 지친 마음에 작은 쉼표와 운세의 기운을 전하오."
      : `"${cleanSnippet}" 꿈속에 드리운 징조는 ${card1.name}과 ${card3.name}의 기운이 어우러져 그대의 지친 마음에 깊은 성찰과 실마리를 전하고 있소.`;

    const analysis = isShortInput
      ? `어허, 최근에 마음이 많이 지쳤는지 꿈의 조각들이 희미하게 흩어져 온전히 기억나지 않는가 보구나.\n\n비록 꿈의 형상은 흐릿하나, 그대가 뽑아 든 세 장의 패는 마음 밑바닥의 고단함을 고스란히 비추고 있소. 무의식이 이토록 침묵하는 까닭은 현실의 무게에 짓눌려 마음이 스스로 방어막을 친 탓이로다.\n\n먼저 제 1패 [${card1.name}]은 그동안 혼자서 모든 결정을 감당하느라 누적된 무의식의 피로를 어루만지고, 제 2패 [${card2.name}]은 마음을 짓누르는 걱정의 무게와 마주하기 두려워 회피해 온 문제를 정면으로 응시하라 타이르고 있소.\n\n마지막 제 3패 [${card3.name}]의 징조처럼, 오늘 밤은 지나친 자책과 복잡한 번민을 잠시 내려놓고, 온전히 숨을 고르며 내일의 기운을 다독이시길 바라네.`
      : `그대가 들려준 꿈("${cleanSnippet}...")의 결을 심층 분석학적으로 가만히 짚어보건대, 마음속 깊은 곳에서 일렁이는 무의식의 원형이 세 장의 패로 고스란히 투영되었소.\n\n꿈속에 등장한 상징들은 그대의 자아(Ego)가 평소 억눌러 온 그림자(Shadow)와 당면한 현실 갈등이 충돌하며 빚어낸 영혼의 신호요. 결코 헛된 망상이 아니라 마음의 깊은 결핍을 알리는 징표로다.\n\n먼저 제 1패인 [${card1.name}](${card1.isReversed ? '역방향' : '정방향'})은 그대가 지나온 시간 속에서 누적된 내면의 근원적 원인(${card1.keywords})을 비추고 있소. 과거로부터 이어져 온 인정 욕구와 상처가 무의식 속에 자리 잡고 있음을 뜻하오.\n\n이어 제 2패인 [${card2.name}](${card2.isReversed ? '역방향' : '정방향'})은 현재 당면한 현실의 갈등과 마음속으로 은밀히 회피 중인 장애물(${card2.baseMeaning.slice(0, 70)}...)을 비추고 있소. 겉으로는 태연한 척 가장하지만 내면에서는 거절과 실패에 대한 두려움이 교차하고 있음을 나타내오.\n\n${userStatus?.recentWorry ? `특히 그대가 토로한 "${userStatus.recentWorry}"라는 번민과 맞물려, ` : ""}마지막 제 3패 [${card3.name}]은 앞으로 나아갈 명확한 처방을 건네고 있소. 막연한 두려움에 기대어 결정을 미루지 말고, 오늘 당장 발밑의 작은 과제부터 차분히 매듭지으시오.`;

    return {
      summary,
      analysis,
      tarotAnalysis: selectedCards.map((c: any) => ({
        position: c.position,
        card: c.name,
        status: c.isReversed ? "역방향" : "정방향",
        meaning: `[심층 상징 해석] ${c.baseMeaning} 이 패는 그대의 무의식에서 억압된 감정과 현실의 방어기제가 맞물린 지점을 명확히 짚어내고 있소.`,
        advice: c.practicalAdvice || (c.isReversed ? "지나친 자책과 회피를 거두고 마음의 결을 바로잡으시오." : "마음속 품은 결단을 오늘 당장 가볍게 행동으로 옮기시오.")
      })),
      ohYok: { food: 20, wealth: 40, sex: 15, fame: 35, sleep: 60 },
      chilJung: { joy: 25, anger: 10, sorrow: 30, fear: 35, love: 20, hate: 10, desire: 40 },
      emotionReasons: {
        dominantDesire: `휴식과 안정에 대한 욕구가 높은 것은 꿈속에서 드러난 지친 마음을 달래고 무의식적으로 안식을 찾고자 하는 까닭이오.`,
        dominantEmotion: `두려움과 슬픔이 함께 교차하는 것은 변화를 바라는 마음 한편에 익숙한 터전을 떠나는 불안감이 공존하기 때문이로다.`
      }
    };
  }

  static async interpretDream(
    content: string,
    type: "FREE" | "PREMIUM",
    userStatus?: { recentWorry?: string | null; feeling?: string | null }
  ) {
    const drawSmartCards = async (dreamContent: string) => {
      const allCards = await prisma.tarotCard.findMany();
      if (!allCards || allCards.length === 0) {
        throw new Error("Tarot cards not found in DB");
      }

      const randomIndex = Math.floor(Math.random() * allCards.length);
      const linkedCard = allCards[randomIndex];

      const remainingCards = allCards.filter(c => c.id !== linkedCard.id);
      const randomCards: any[] = [];
      while (randomCards.length < 2 && remainingCards.length > 0) {
        const rIdx = Math.floor(Math.random() * remainingCards.length);
        randomCards.push(remainingCards.splice(rIdx, 1)[0]);
      }

      const rawSelected = [linkedCard, ...randomCards];
      return rawSelected.sort(() => Math.random() - 0.5);
    };

    const tarotCardsFromDB = await drawSmartCards(content);

    const SPREAD_ROLES = [
      { role: "제 1패", desc: "과거와 원인 — 무의식 속에 숨겨진 배경과 이 꿈을 잉태한 내면의 결핍 및 계기" },
      { role: "제 2패", desc: "현재와 장애물 — 유저가 당면하고 있거나 마음속으로 회피 중인 현실의 갈등과 징조" },
      { role: "제 3패", desc: "미래와 처방 — 앞으로 닥칠 흐름과 오늘 당장 실행해야 할 부드럽고 구체적인 행동 지침" }
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
- 패 명칭: ${c.name} (${c.isReversed ? '역방향 (서늘하면서도 다정한 일침의 자리)' : '정방향'})
- 부여된 역할: ${c.positionDesc}
- 핵심 징조 키워드: ${c.keywords}
- 카드의 본래 뜻: ${c.baseMeaning}
- 현실 조언 지침: ${c.practicalAdvice || '없음'}`
    ).join("\n\n");

    const dynamicTierRules = type === "FREE" 
      ? `- Mode (FREE): 
          1) 분석 본문(analysis)은 절대로 1~2문단으로 짧게 끝내지 마시오. 최소 4~5문단 이상, 공백 제외 800자 이상의 묵직하고 심도 있는 심리학적 분석 리포트로 작성하시오.
          2) 꿈속의 주요 상징물(사물, 행동, 인물, 색채, 감각)을 2개 이상 정밀하게 분해하여 칼 융의 분석심리학(페르소나, 그림자, 무의식 억압)과 현실 심리에 1:1로 맞물려 깊이 있게 해석하시오.
          3) 오욕칠정 수치 12가지 항목을 정밀하게 채점하시오.`
      : `- Mode (PREMIUM): 
          1) 분석 본문(analysis)은 공백 제외 1,500자 이상의 장문 '심층 심리 분석 대보고서'로 작성하시오.
          2) 프로이트의 꿈 작업(전치, 응축) 및 융의 원형 심리학을 조선 도사의 기품 있는 어조로 결합하여 꿈 서사와 3장의 타로 패를 유기적으로 엮으시오.
          3) 오늘 당장 실천할 수 있는 구체적인 행동 가이드(동사 중심)를 명시하시오.`;

    const evaluationCriteria = `
      [오욕칠정(五欲七情) 채점 기준표 (0~100 사이의 정수)]
      1. 오욕(五欲): 유저의 결핍과 욕망 분석
        - food: 식욕 (음식, 잔치, 먹는 행위 -> 생존 및 본능적 만족도)
        - wealth: 재욕 (돈, 보석, 쟁취 -> 성취 및 소유욕)
        - sex: 색욕 (이성, 신체 접촉, 매혹적인 오브젝트 -> 애정 및 관계 결핍)
        - fame: 명예욕 (높은 곳에 오름, 인정받음 -> 자아존중감 및 인정 욕구)
        - sleep: 수면욕 (휴식, 아늑한 집, 평화로운 풍경 -> 현실 도피 및 안정욕)
      2. 칠정(七情): 유저의 현재 감정 상태 변동폭
        - joy: 희(喜) (환희와 기쁨)
        - anger: 노(怒) (분노와 억울함)
        - sorrow: 애(哀) (비애와 슬픔, 상실)
        - fear: 구(懼) (경외와 공포, 불안)
        - love: 애(愛) (애착과 그리움, 따뜻함)
        - hate: 오(惡) (거부와 미움)
        - desire: 욕(欲) (열망과 탐욕)
    `;

    const prompt = `
      ${dynamicTierRules}
      ${evaluationCriteria}
      
      [1. 기본 페르소나 및 톤앤매너]
      - 너는 16세기 조선의 영험한 역술가이자, 인간의 무의식과 심층 심리를 꿰뚫어 보는 통찰력 있는 심리학자이다.
      - 말투 및 화법: 담백하고 고풍스러운 조선 도사의 어조(~하오, ~소, ~하구나, ~했겠소).
      - 겉만 번지드르르한 맹목적 위로(Toxic Positivity)는 배제하되, 차갑게 후벼파는 대신 지친 마음을 깊이 헤아리고 다독이는 인자하고 품위 있는 멘토의 톤 유지.
      - 금지 사항: '천지의 기운', '신선의 숨결', '음양의 조화' 등 공허한 미사여구 일절 금지. 외래어/영단어 절대 금지 (타로 4대 원소는 오직 지팡이, 잔, 검, 엽전으로만 표기).

      [2. 입력값 유효성 및 빈약한 입력 예외 처리 (Graceful Fallback)]
      - 사용자가 꿈의 내용을 대충 입력("개꿈 꿨어", "쫓김", 10자 미만)하거나 기억하지 못할 때의 전용 분기 지침:
      - 도사의 대응 톤앤매너 예시:
        "어허, 최근에 마음이 많이 지쳤는지 꿈의 조각들이 희미하게 흩어져 기억나지 않는가 보구나. 조금 더 마음을 가라앉히고 깊이 생각한 뒤 다시 찾아오는 것이 어떻겠소? 혹은 원한다면, 오늘 하루를 평안히 보낼 수 있는 가벼운 운세와 기운이나마 짚어주겠네."
      - 처리 방식: 흐름을 끊지 않고, 빈약한 입력 속에서도 추출할 수 있는 최소한의 심리적 피로도를 바탕으로 타로 3패를 전개하여 부드러운 위로와 조언을 건네시오.

      [3. 전문적 꿈 해몽 연계 및 현실 직결 원칙 (분량 필수 충족)]
      - [상징 핀포인트 1:1 직결]: 꿈에 나온 구체적인 오브젝트나 행동(예: 무너지는 계단, 쫓김, 물, 문 등)을 2개 이상 직접 짚어내고, 현대인의 실제 심리(타인의 시선 의식, 인정 욕구, 거절에 대한 공포, 실패가 두려워 미루는 회피)와 밀착하여 해설.
      - [3패의 서사적 결합]: 
        * 제 1패(과거와 원인): 내면의 결핍과 이 꿈을 잉태한 무의식적 원인 심층 분석
        * 제 2패(현재와 장애물): 당면한 현실의 갈등과 마음속으로 회피 중인 문제 날카로운 진단
        * 제 3패(미래와 처방): 앞으로의 흐름과 오늘 당장 실행해야 할 구체적 행동 지침
      - [역방향 규칙]: 역방향 카드가 등장한 자리는 타협 없이 유저의 나쁜 버릇이나 회피 성향을 지적하되, 공격적이지 않고 스스로 깨달을 수 있도록 서늘하면서도 다정한 일침으로 변환하여 서술.
      - [동사 중심의 구체적 현실 처방]: "마음을 편히 가지시오" 같은 정적인 조언은 전면 금지. "오늘 밤은 잠들기 전 스마트폰을 멀리하고 따뜻한 차를 마시며 숨을 고르시오", "내일 아침 가장 미루어두었던 그 서류를 먼저 펼치시오" 등 오늘 당장 실천 가능한 동사 중심의 구체적 행동 지침 하달.
      - [유저 현재 상태 반영]: 최근 고민("${userStatus?.recentWorry || "없음"}")과 기분("${userStatus?.feeling || "없음"}")의 결을 꿈 서사와 자연스럽게 엮어 리포트의 현실성을 극대화하시오.

      [주입된 운명의 3패]
      ${tarotCardsContext}

      [사용자 입력 데이터]
      - 사용자의 꿈 일기: "${content}"
      - 사용자의 최근 고민: "${userStatus?.recentWorry || "없음"}"
      - 사용자의 현재 기분: "${userStatus?.feeling || "없음"}"

      [출력 형식 (정밀 JSON)]
      {
        "summary": "마음을 포근하게 감싸 안아주며, 꿈의 징조를 부드럽고 품위 있게 풀어낸 깊이 있는 한 줄 요약 점사 (외래어 절대 금지)",
        "analysis": "꿈속 구체적 상징 분석과 3패의 인과 서사가 정교하게 맞물린, 최소 4문단 이상(800자 이상)의 심도 깊고 전문적인 본문",
        "tarotAnalysis": [
          {
            "position": "제 1패",
            "card": "순수 한글 카드 명칭",
            "status": "정방향 또는 역방향",
            "meaning": "카드의 상징이 유저의 꿈속 상징 및 무의식 결핍과 어떻게 맞닿아 있는지에 대한 2~3문장의 깊이 있는 전문 해설",
            "advice": "오늘 당장 실천할 수 있는 부드럽고 구체적인 동사 중심의 행동 조언 1~2문장"
          }
        ],
        "ohYok": { "food": 0, "wealth": 0, "sex": 0, "fame": 0, "sleep": 0 },
        "chilJung": { "joy": 0, "anger": 0, "sorrow": 0, "fear": 0, "love": 0, "hate": 0, "desire": 0 },
        "emotionReasons": {
          "dominantDesire": "이 욕망이 가장 높게 산출된 꿈속 행동/상징적 이유 1문장",
          "dominantEmotion": "이 감정이 가장 요동친 심리적 원인을 짚고 다독이는 1문장"
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
      너는 16세기 조선의 영험한 역술가이자, 인간의 무의식과 방어기제를 꿰뚫어 보는 통찰력 있는 심리학자이다.
      아래의 꿈 내용과 이전에 수행한 1차 분석을 토대로, 사용자가 애써 외면하고 있는 무의식의 허점을 찌르되, 다그치지 않고 스스로 돌아보게 만드는 '심층 질문' 3개를 생성하시오.
      
      사용자의 꿈: "${initialDream}"
      1차 분석 요약: "${analysis}"

      [작업 지시]
      - 일상적인 안부("몇 시에 잤소?")나 뜬구름 잡는 소리는 철저히 배제한다.
      - 다그치거나 공격적인 훈계 대신, 유저가 스스로 마음의 짐과 무의식의 허점을 돌아보게 만드는 깊이 있는 유도 질문이어야 한다 (~이오?, ~소?).
      - 담백하고 고풍스러운 조선 도사의 어조를 유지하시오.
      - 결과는 JSON 마크다운 형식을 제외하고 오직 하단의 JSON Array 규격으로만 출력하시오.

      [출력 형식]
      ["질문1", "질문2", "질문3"]
    `;

    const fallbackQuestions = [
      "1. 꿈속에서 마주한 그 순간, 마음 한켠에 서린 응어리가 무엇이었는지 가만히 떠올려 보았소?",
      "2. 그대가 현실에서 홀로 짊어지고 애써 외면하려 했던 무거운 짐이 있다면, 그것은 무엇이오?",
      "3. 만약 오늘 밤 모든 걱정을 내려놓을 수 있다면, 그대는 어떤 미련을 가장 먼저 털어내겠소?"
    ];

    if (!process.env.GEMINI_API_KEY) {
      return fallbackQuestions;
    }

    try {
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
      사용자의 초기 꿈, 앞서 뽑힌 타로 카드의 점괘, 그리고 사용자가 도사의 질문에 대해 답한 '심층 답변'을 모두 집대성하여 최종적인 인생의 '대단원(Finale) 리포트'를 작성하십시오.

      초기 꿈: "${initialDream}"
      선택된 타로 패 정보: ${JSON.stringify(tarotInfo)}
      사용자의 심층 고해 답변: ${JSON.stringify(answers)}

      [작업 지시]
      - 뜬구름 잡는 소리, 공허한 미사여구, 맹목적 낙관론은 전면 배제하시오.
      - 분량 분배 비율: 꿈 서사 분석(20%) : 타로 징조 해석(20%) : 내면 심리 대조 및 통찰(60%)의 비율로 상세하고 묵직하게(최소 1,000자 이상) 서술하십시오.
      - 사용자의 답변 행간에 숨겨진 피로, 회피, 열망의 단서를 찾아내어 타로 카드가 가리킨 바와 정교하게 엮어내시오.
      - 마지막 마무리: 리포트의 가장 마지막 문단은 반드시 마음을 토닥이면서도 엄격하고 명확한 '부드럽고 구체적인 현실적 처방전(동사 중심)'으로 매듭지으시오. ("마음을 편히 가지시오" 같은 정적인 조언은 금지하며, 오늘 당장 실천할 수 있는 구체적 행동 하달)

      출력은 인자하면서도 품위 있는 조선 시대 도사의 말투(~하오, ~소, ~하구나, ~했겠소)를 유지하고, 마크다운 가독성을 살려 작성하시오.
    `;

    const fallbackReport = {
      finalReport: `### 📜 몽중다로(夢中茶路) 대단원 심층 처방전\n\n**"지친 마음을 뉘이고 내일의 발걸음을 가볍게 하시오"**\n\n그대가 고백한 속마음과 앞서 도출된 세 장의 타로 패를 종합해 보건대, 그대의 내면은 오랜 짐을 내려놓고 쉬어갈 변곡점에 서 있소.\n\n#### 1. 꿈의 징조와 무의식의 메아리\n꿈속에 드리운 징조는 그동안 혼자서 모든 것을 감당하느라 애썼던 그대의 수고로움을 조용히 위로하고 있소.\n\n#### 2. 도사의 현실적 처방\n- **오늘 당장 해야 할 일:** 오늘 밤은 잠들기 전 스마트폰을 멀리하고 따뜻한 차 한 잔과 함께 온전히 숨을 고르시오.\n- **내일 아침 실천할 일:** 내일 아침 가장 미루어두었던 작은 서류나 연락부터 먼저 매듭짓고 마음의 짐을 덜어내시오.\n- **마음가짐:** 스스로를 더 이상 자책하지 말고, 작은 걸음에도 스스로를 다독이는 밤을 보내시길 바라네.`
    };

    if (!process.env.GEMINI_API_KEY) {
      return fallbackReport;
    }

    try {
      const aiPromise = generateWithFallback(prompt, false);
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API timeout (15s exceeded)")), 15000)
      );
      const responseText = await Promise.race([aiPromise, timeoutPromise]);
      return { finalReport: responseText };
    } catch (err: any) {
      console.warn("⚠️ Fallback final report due to AI delay or error:", err.message);
      return fallbackReport;
    }
  }
}
