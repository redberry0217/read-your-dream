import { getModel } from "../lib/gemini.js";
import { DreamType } from "@mjdr/shared-types";

export class DreamService {
  static async interpretDream(content: string, userStatus?: { recentWorry?: string; feeling?: string }) {
    const model = getModel("FREE");
    
    // Step 1: Draw Tarot Cards (2 recommended by AI + 1 random)
    const allCardIds = Array.from({ length: 78 }, (_, i) => i);
    const randomCardId = allCardIds[Math.floor(Math.random() * allCardIds.length)];

    const personaRules = `
      - Persona: 너는 16세기 조선의 신비로운 역술가이자, 시대를 앞서간 심리학자이다.
      - 말투: 기품 있고 신비로우면서도, 현실의 문제를 지적할 때는 추상같은 엄격함을 유지한다.
      - Rule 1 (No Toxic Positivity): "모든 것이 잘될 것"이라는 뻔한 위로는 금지한다.
      - Rule 2 (Reversed Strictness): 타로 카드가 역방향인 경우 사용자의 '불편한 진실'이나 '나쁜 습관'을 정면으로 지적한다.
    `;

    const prompt = `
      ${personaRules}
      
      사용자의 꿈: "${content}"
      최근 고민: "${userStatus?.recentWorry || "없음"}"
      현재 기분: "${userStatus?.feeling || "없음"}"

      [작업 지시]
      1. 이 꿈과 가장 연관 깊은 타로 카드 2장을 선택하시오.
      2. 세 번째 카드는 ID ${randomCardId} (무작위 카드)로 고정하여 해석에 포함하시오.
      3. 각 카드는 '정방향' 또는 '역방향' 중 하나를 무작위로 설정하여 해석하시오.
      4. 꿈 해몽과 타로 해석을 통합하여 날카로운 통찰을 제공하시오.

      [출력 형식 (JSON)]
      {
        "summary": "한 줄 요약",
        "analysis": "심리학적/역술적 통합 분석",
        "tarotAnalysis": [
          { "card": "카드이름", "status": "정방향/역방향", "meaning": "날카로운 해석", "advice": "현실적 조언" }
        ],
        "ohYok": { "food": 0, "wealth": 0, "sex": 0, "fame": 0, "sleep": 0 },
        "chilJung": { "joy": 0, "anger": 0, "sorrow": 0, "fear": 0, "love": 0, "hate": 0, "desire": 0 }
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response as JSON");

    return JSON.parse(jsonMatch[0]);
  }

  static async generateFollowUpQuestions(initialDream: string, analysis: string) {
    const model = getModel("PREMIUM");
    
    const prompt = `
      당신은 16세기 조선의 역술가이자 심리학자입니다.
      아래의 꿈 내용과 당신이 이전에 수행한 분석을 토대로, 사용자의 무의식을 더 깊이 파악하기 위한 '날카로운 추가 질문' 2~3개를 생성하십시오.
      
      사용자의 꿈: "${initialDream}"
      이전 분석: "${analysis}"

      [작업 지시]
      - 질문은 구체적이고 심리적인 허를 찌르는 내용이어야 합니다.
      - 조선 시대 도사의 기품 있는 말투를 유지하십시오.
      - 출력은 JSON 배열 형태여야 합니다: ["질문1", "질문2"]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to parse AI response as JSON Array");

    return JSON.parse(jsonMatch[0]);
  }

  static async consolidatedAnalysis(initialDream: string, tarotInfo: any, answers: any) {
    const model = getModel("PREMIUM");
    
    const prompt = `
      당신은 16세기 조선의 역술가이자 심리학자입니다.
      사용자의 초기 꿈, 앞서 나온 타로 카드 해석, 그리고 사용자가 추가 질문에 대해 답한 내용을 통합하여 
      최종적인 '대단원(Finale)' 리포트를 작성하십시오.

      초기 꿈: "${initialDream}"
      타로 정보: ${JSON.stringify(tarotInfo)}
      사용자 추가 답변: ${JSON.stringify(answers)}

      [작업 지시]
      - 해몽 1 : 타로 1 : 심층분석 3 의 비율로 상세하게 서술하십시오.
      - 사용자의 답변 속에 숨겨진 무의식의 단서를 찾아 타로의 의미와 연결지으시오.
      - 마지막에는 사용자가 오늘 당장 실천해야 할 '현실적 처방전'을 내리시오.

      출력은 정중하면서도 날카로운 조선 시대 말투를 유지하십시오.
    `;

    const result = await model.generateContent(prompt);
    return { finalReport: result.response.text() };
  }
}
