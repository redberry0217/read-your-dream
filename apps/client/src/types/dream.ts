export type TarotCard = {
  card: string;
  status: string;
  meaning: string;
  advice: string;
  position?: string;
};

export type OhYok = {
  food: number;
  wealth: number;
  sex: number;
  fame: number;
  sleep: number;
};

export type ChilJung = {
  joy: number;
  anger: number;
  sorrow: number;
  fear: number;
  love: number;
  hate: number;
  desire: number;
};

export type DreamLog = {
  id: string;
  content: string;
  type: 'FREE' | 'PREMIUM';
  summary: string;
  createdAt: string;
  tarotAnalysis: TarotCard[];
};

export type InterpretResult = {
  dreamContent?: string;
  worryTags?: string[];
  summary: string;
  analysis: string;
  tarotAnalysis: TarotCard[];
  ohYok: OhYok;
  chilJung: ChilJung;
  savedLog: DreamLog;
  emotionReasons?: {
    dominantDesire?: string;
    dominantEmotion?: string;
  };
};

export type DeepAnalysisResult = {
  id: string;
  type: 'PREMIUM';
  followUpQuestions: string[];
};

export type ConsolidateResult = {
  id: string;
  finalReport: string;
};

export type InterpretRequest = {
  content: string;
  worryTags?: string[];
  userStatus?: {
    recentWorry?: string;
    feeling?: string;
  };
};

