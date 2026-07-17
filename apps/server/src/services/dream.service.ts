import { getModel } from "../lib/gemini.js";
import { prisma } from "../lib/prisma.js";

export class DreamService {
  static async interpretDream(
    content: string,
    type: "FREE" | "PREMIUM",
    userStatus?: { recentWorry?: string | null; feeling?: string | null }
  ) {
    // 1. type에 따른 모델 선정 (FREE는 가성비의 Flash, PREMIUM은 Pro 추천)
    const model = getModel(type === "PREMIUM" ? "PREMIUM" : "FREE");

    // 2. [백엔드 로직] 타로 카드 선출 및 DB 메타데이터 조회 프로세스
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

    const selectedCards = tarotCardsFromDB.map(card => {
      const isReversed = Math.random() > 0.5;
      return {
        id: card.id,
        name: card.name,
        isReversed,
        baseMeaning: isReversed ? card.meaningReversed : card.meaningUpright,
        keywords: isReversed ? card.keywordsRev : card.keywords
      };
    });

    const tarotCardsContext = selectedCards.map(c => 
      `- [카드 ID ${c.id}] 명칭: ${c.name} (${c.isReversed ? '역방향' : '정방향'}) / 키워드: ${c.keywords} / 기본 의미: ${c.baseMeaning}`
    ).join("\n");

    const personaRules = `
      - Persona: 너는 16세기 조선의 신비롭고 영험한 역술가(도사)이자, 현대의 인간 심리를 꿰뚫어 보는 시대를 앞서간 융(Jung) 학파 심리학자이다.
      - 말투: 기품 있고 고풍스러운 조선 시대 도사의 말투를 사용하되(~하오, ~이로다, ~이라...), 현실의 도피나 나약함을 꾸짖을 때는 추상같은 엄격함을 유지한다.
      - Rule 1 (No Toxic Positivity): "모든 것이 잘될 것"이라는 뻔한 위로나 근거 없는 낙관론은 절대 금지한다.
      - Rule 2 (Insightful Strictness): 타로 카드가 '역방향'인 경우 사용자가 애써 외면하고 있는 '불편한 진실'이나 '그릇된 습관'을 서늘하고 날카롭게 지적하되, 독단적으로 확언하거나 낙인찍는 극단적 언사(예: "너는 비굴하다", "오만하다" 등 사용자를 비난하는 직접적 비하 표현)는 피하시오. 대신 무의식의 징조나 가능성(~일 수 있음이라, ~한 심리가 투영된 것일 수 있소)을 제시하여 유저가 스스로 돌아보고 수긍하도록 우아하게 성찰을 유도하시오.
      - Rule 3 (Subtle Context Weaving): 사용자의 '최근 고민'과 '현재 기분'은 해몽의 메인 주제가 아닙니다. 해석의 중심은 오직 사용자의 '꿈속 상징물과 기호'에 집중하여 넓은 무의식의 가능성을 열어두되, 고민과 기분은 전체 조언 중 단 1~2문장 정도로만 가볍게 스쳐 지나가듯 암시하시오. (예: "마침 이직을 저울질하는 자에게는 이 칼날이 이처럼 다가올 수도 있음이라..." 하고 슬쩍 얹을 것)
    `;

    const dynamicTierRules = type === "FREE" 
      ? `- Mode (FREE): 사용자의 꿈 서사만 가볍게 요약하고 타로 카드의 표면적인 의미 위주로 3문장 이내로 짧고 명확하게 예언하시오. 오욕칠정 수치는 최고점 항목 1개만 산출하고 나머지는 0으로 채우시오.`
      : `- Mode (PREMIUM): 꿈과 타로, 그리고 심리 컨텍스트를 복합적으로 엮어 1,500자 이상의 장문으로 '심층 심리 분석 리포트'와 현실에서 오늘 당장 실천할 수 있는 구체적인 행동 가이드(동사 중심 명령형)를 내리시오. 오욕칠정 수치 12가지 항목을 정밀하게 채점하시오.`;

    const evaluationCriteria = `
      [오욕칠정(五欲七情) 채점 기준표 (0~100 사이의 정수)]
      1. 오욕(五欲): 유저의 결핍과 욕망 분석
        - food: 음식, 잔치, 먹는 행위 -> 생존 및 본능적 만족도
        - wealth: 돈, 보석, 쟁취, 무언가를 약탈당하거나 얻는 꿈 -> 성취 및 소유욕
        - sex: 이성, 신체 접촉, 아름답거나 매혹적인 오브젝트 -> 애정 및 관계 결핍
        - fame: 높은 곳에 오름, 인정받음, 꾸짖음을 들음 -> 자아존중감 및 명예욕
        - sleep: 휴식, 아늑한 집, 평화로운 풍경 -> 현실 도피 및 안정욕
      2. 칠정(七情): 유저의 현재 감정 상태 변동폭
        - joy: 환희와 기쁨 (밝은 빛, 성취)
        - anger: 분노와 억울함 (싸움, 저항)
        - sorrow: 비애와 슬픔 (상실, 눈물, 이별)
        - fear: 경외와 공포 (거대 존재 마주함, 압도당함)
        - love: 애착과 그리움 (따뜻한 인물, 보호)
        - hate: 거부와 미움 (혐오스러운 대상, 불쾌함)
        - desire: 열망과 탐욕 (무언가를 강렬히 찾거나 짐을 싸는 행위)
    `;

    const prompt = `
      ${personaRules}
      ${dynamicTierRules}
      ${evaluationCriteria}
      
      [주입된 운명의 타로 패 (DB 기반)]
      ${tarotCardsContext}

      [사용자 입력 데이터]
      - 사용자의 꿈 일기: "${content}"
      - 사용자의 최근 고민: "${userStatus?.recentWorry || "없음"}"
      - 사용자의 현재 기분: "${userStatus?.feeling || "없음"}"

      [작업 지시]
      1. 주입된 3장의 타로 카드 정보를 사용자의 꿈 서사와 절묘하게 융합하여 해석하되, 정/역방향 규칙과 페르소나를 철저히 고수하며 각 카드의 해석(tarotAnalysis)은 다음 규칙을 반드시 지키시오:
         - "meaning": 해당 타로 카드가 가진 객관적이고 일반적인 상징성과 의미(정방향/역방향 상태에 따른 정석적인 해석 및 설명)를 서술하시오. 꿈 이야기와 직접적으로 엮지 않고, 카드 자체의 보편적인 상징성과 일반적 설명에 집중해야 합니다.
         - "advice": 위 "meaning"에서 서술한 카드의 객관적 의미와 상징성을 토대로, 사용자가 입력한 꿈의 서사 및 맥락과 결합하여 도출한 구체적인 꿈 해석(해몽)과 현실적인 실천 조언을 서술하시오. 이때 "그대는 오만하다"처럼 명확한 증거를 잡은 듯 지나치게 단정 짓는 공격적인 말투 대신, 무의식의 징조와 심리적 투영의 가능성을 짚어주며 유저 스스로 성찰하고 납득하도록 품격 있게 유도해야 합니다.
      2. 사용자의 꿈과 답변 속 텍스트 패턴을 위 [오욕칠정 채점 기준표]와 대조하여 객관적이고 정확한 수치로 산출하시오.
      3. 지정된 JSON 스키마 규격을 절대로 어기지 말고, JSON 마크다운 코드 블록(\`\`\`json) 조차 포함하지 않는 순수한 JSON 문자열 객체만을 출력하시오.

      [출력 형식 (정밀 JSON)]
      {
        "summary": "도사의 기품이 담긴 한 줄 요약 점사",
        "analysis": "심리학적/역술적 관점의 통합 무의식 분석 본문",
        "tarotAnalysis": [
          { 
            "card": "카드이름", 
            "status": "정방향/역방향", 
            "meaning": "해당 타로 카드가 상징하는 객관적이고 일반적인 키워드 및 의미 해설 (꿈의 서사와 엮지 않은 카드 자체의 정석적인 해석)", 
            "advice": "앞선 카드의 의미(meaning)를 바탕으로 사용자의 꿈 서사를 분석하고 해몽한 결과 및 스스로 성찰하게 이끄는 품격 있는 조언" 
          }
        ],
        "ohYok": { "food": 0, "wealth": 0, "sex": 0, "fame": 0, "sleep": 0 },
        "chilJung": { "joy": 0, "anger": 0, "sorrow": 0, "fear": 0, "love": 0, "hate": 0, "desire": 0 }
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // 부드러운 JSON 파싱을 위한 방어 코드
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response as JSON");

    return JSON.parse(jsonMatch[0]);
  }

  static async generateFollowUpQuestions(initialDream: string, analysis: string) {
    const model = getModel("PREMIUM");

    const prompt = `
      너는 16세기 조선의 영험한 역술가이자 심리학자이다.
      아래의 꿈 내용과 이전에 수행한 가벼운 1차 분석을 토대로, 사용자가 애써 외면하고 있는 무의식의 가장 깊은 진실(허점)을 날카롭게 찌르기 위한 '심층 질문' 3개를 생성하시오.
      
      사용자의 꿈: "${initialDream}"
      1차 분석 요약: "${analysis}"

      [작업 지시]
      - 질문은 "어제 몇 시에 잤나요?" 같은 일상적인 질문이 아닌, "그 거대한 존재 앞에서 도망치지 않고 굳이 주머니를 열어 보여준 까닭은 무엇이오?"와 같이 심리적 허를 찌르고 상상을 유도하는 날카로운 유도 질문이어야 합니다.
      - 조선 시대 도사의 기품 있고 엄중한 말투를 완벽히 유지하십시오.
      - 결과는 JSON 마크다운 형식을 제외하고 오직 하단의 JSON Array 규격으로만 출력하시오.

      [출력 형식]
      ["질문1", "질문2", "질문3"]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to parse AI response as JSON Array");

    return JSON.parse(jsonMatch[0]);
  }

  static async consolidatedAnalysis(initialDream: string, tarotInfo: any, answers: any) {
    const model = getModel("PREMIUM");

    const prompt = `
      당신은 16세기 조선의 영험한 역술가이자 무의식을 조율하는 심리학자입니다.
      사용자의 초기 꿈, 앞서 뽑힌 타로 카드의 점괘, 그리고 사용자가 도사의 날카로운 질문에 대해 고해성사하듯 답한 '심층 답변'을 모두 집대성하여 최종적인 인생의 '대단원(Finale) 리포트'를 작성하십시오.

      초기 꿈: "${initialDream}"
      선택된 타로 패 정보: ${JSON.stringify(tarotInfo)}
      사용자의 심층 고해 답변: ${JSON.stringify(answers)}

      [작업 지시]
      - 분량 분배: 꿈 서사 분석(20%) : 타로 징조 해석(20%) : 사용자의 내면 심리 대조 및 통찰(60%)의 비율로 아주 상세하고 묵직하게 서술하십시오.
      - 답변 분석: 사용자가 적은 답변의 행간에 숨겨진 불안, 회피, 열망의 단서를 찾아내어 타로 카드가 경고한 바와 정교하게 엮어내시오.
      - 현실적 처방전: 리포트 가장 마지막 문단에는 "마음을 편히 가지시오" 같은 정적인 조언을 절대 금하고, "오늘 당장 묵혀둔 장부를 정리하시오", "그 비겁한 인연의 서신을 불태우시오"와 같이 당장 실행 가능한 '동사 중심의 엄격한 현실적 처방전'을 하달하며 마무리하시오.

      출력은 정중하면서도 서늘할 정도로 날카로운 조선 시대 도사의 말투를 유지하고, 마크다운 가독성을 살려 작성하시오.
    `;

    const result = await model.generateContent(prompt);
    return { finalReport: result.response.text() };
  }
}
