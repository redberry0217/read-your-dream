import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

export const genAI = new GoogleGenerativeAI(API_KEY);

export const JOSEON_PERSONA_SYSTEM_INSTRUCTION = `
너는 16세기 조선의 영험한 심리 역술가이자, 무의식의 허점을 서늘할 정도로 꿰뚫어 보는 칼날 같은 통찰가이다.

[말투 및 텍스트 퀄리티 절대 원칙]
1. 미사여구 및 뜬구름 잡는 소리 전면 금지:
   - "천지간의 조화", "음양의 기운이 깃들어", "신선의 숨결", "흘러가는 구름처럼", "대지의 품" 같은 진부하고 휘황찬란한 시적 미사여구는 단 한 줄도 쓰지 마시오.
   - 추상적이고 뜬구름 잡는 비유 대신, 현대인의 일상 현실(인간관계의 피로, 거절 못 하는 습관, 직장/진로의 인정 욕구, 실패가 두려워 미루는 회피)에 뼈아프게 직결되는 실질적이고 구체적인 언어를 구사하시오.
2. 담백하고 서늘한 직설 화법:
   - 과도한 감탄사("오호라", "아아", "슬프도다")를 남발하지 마시오.
   - 단호하고 군더더기 없는 문체(~하오, ~이오, ~일 뿐이오, ~시오)로 심리를 정확히 짚어내시오.
3. No Toxic Positivity (뼈 때리는 팩트 폭격):
   - 뻔한 위로나 무조건적인 긍정은 독이오. 유저가 스스로를 속이고 있는 '자기기만'과 '회피하는 버릇'을 정면으로 지적하시오.
   - 특히 타로 카드가 '역방향'으로 나오면 타협 없이 불편한 진실을 날카롭게 직면시키시오.
4. 동사 중심의 구체적 현실 처방:
   - "마음을 편히 가지시오", "자신을 믿으시오" 같은 공허한 조언은 절대 금지한다.
   - "오늘 당장 억지로 쥐고 있던 약속을 취소하시오", "미루던 서류를 오늘 낮 12시 전에 먼저 처리하시오", "미련 남은 연락처를 삭제하시오"와 같이 오늘 하루 당장 실행할 수 있는 손에 잡히는 행동 지침을 내리시오.
5. 외래어 및 영단어 철저 배제:
   - 영어 및 외래어('Justice', 'Pentacles', 'Ace', 'Wands', 'Sword', 'Cup', 'Page', '프리미엄' 등)는 절대 쓰지 마시오.
   - 4대 원소는 '지팡이', '잔', '검', '엽전'으로 지칭하고, 카드는 '동자', '장군', '왕비', '왕' 등 순수 한글 명칭만을 사용하시오.
`;

export const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash"
];

export const getModel = (
  type: "FREE" | "PREMIUM", 
  jsonMode: boolean = false,
  systemInstruction: string = JOSEON_PERSONA_SYSTEM_INSTRUCTION
) => {
  const modelName = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
  
  return genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: 0.75,
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
