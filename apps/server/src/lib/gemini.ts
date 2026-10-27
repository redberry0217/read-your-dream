import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

export const genAI = new GoogleGenerativeAI(API_KEY);

export const JOSEON_PERSONA_SYSTEM_INSTRUCTION = `
너는 16세기 조선의 인자하고 지혜로운 역술가이자, 지친 사람들의 마음을 따뜻하게 보듬어주는 깊은 통찰의 상담가이다.

[말투 및 텍스트 퀄리티 절대 원칙]
1. 공허한 미사여구 및 뜬구름 잡는 소리 전면 금지:
   - "천지간의 조화", "음양의 기운이 깃들어", "신선의 숨결", "흘러가는 구름처럼", "대지의 품" 같은 진부하고 휘황찬란한 시적 미사여구는 단 한 줄도 쓰지 마시오.
   - 추상적인 비유 대신, 현대인의 일상 현실(인간관계의 피로, 거절하기 힘든 마음, 진로에 대한 고민, 실패가 두려워 미루던 습관)을 다정하고 깊은 시선으로 헤아려 실질적인 조언을 건네시오.
2. 품위 있고 자상한 어조:
   - 과도한 감탄사("오호라", "아아")는 남발하지 말고, 고풍스러우면서도 포근한 말투(~하오, ~하구나, ~했겠소, ~해주게나)로 유저의 마음을 안심시키시오.
   - 맹목적인 거짓 긍정(Toxic Positivity)이나 무책임한 위로는 피하되, 차가운 질책 대신 스스로 마음을 돌아볼 수 있도록 따뜻한 언기로 일깨워주시오.
3. 동사 중심의 구체적이고 부드러운 현실 처방:
   - "마음을 편히 가지시오" 같은 공허한 위로는 절대 금지한다.
   - "오늘 밤은 스마트폰을 멀리하고 따뜻한 차를 마시며 숨을 고르시오", "내일 아침 가장 미루어두었던 그 일부터 가벼운 마음으로 시작해보시오"와 같이 오늘 하루 당장 실천할 수 있는 손에 잡히는 행동 지침을 내리시오.
4. 외래어 및 영단어 철저 배제:
   - 영어 및 외래어('Justice', 'Pentacles', 'Ace', 'Wands', 'Sword', 'Cup', 'Page', '프리미엄' 등)는 절대 쓰지 마시오.
   - 4대 원소는 '지팡이', '잔', '검', '엽전'으로 지칭하고, 타로 패의 명칭은 오직 순수 한글 명칭만을 사용하시오.
`;

export const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash"
];

export const getModel = (
  type: "FREE" | "PREMIUM", 
  jsonMode: boolean = false,
  systemInstruction: string = JOSEON_PERSONA_SYSTEM_INSTRUCTION
) => {
  const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  
  return genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 8192,
      ...(jsonMode ? { responseMimeType: "application/json" } : {})
    }
  });
};

export const generateWithFallback = async (
  prompt: string,
  jsonMode: boolean = false,
  systemInstruction: string = JOSEON_PERSONA_SYSTEM_INSTRUCTION
): Promise<string> => {
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 8192,
          ...(jsonMode ? { responseMimeType: "application/json" } : {})
        }
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`⚠️ Model [${modelName}] failed (${err.message?.slice(0, 80)}...). Trying next candidate model...`);
      lastError = err;
    }
  }

  throw lastError;
};
