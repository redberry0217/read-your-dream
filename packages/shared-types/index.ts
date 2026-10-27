export interface User {
  id: string;
  email: string;
  name?: string;
  nickname?: string;
  silver: number;      // 은자 (활동/출석 화폐)
  gold: number;        // 금자 (프리미엄 화폐)
  jewels?: number;     // 하위 호환용
  referralCode?: string;
  lastAttendance?: string;
}

export type DreamType = 'FREE' | 'PREMIUM';

export interface OhYok {
  food: number;    // 식욕
  wealth: number;  // 재욕
  sex: number;     // 색욕
  fame: number;    // 명예욕
  sleep: number;   // 수면욕
}

export interface ChilJung {
  joy: number;     // 희
  anger: number;   // 노
  sorrow: number;  // 애
  fear: number;    // 구
  love: number;    // 애
  hate: number;    // 오
  desire: number;  // 욕
}

export interface TarotAnalysis {
  card: string;
  status: 'Upright' | 'Reversed';
  meaning: string;
  advice: string;
}

export interface DreamLog {
  id: string;
  content: string;
  ohYok?: OhYok;
  chilJung?: ChilJung;
  type: DreamType;
  createdAt: string;
  tarotCards?: string[];
  tarotAnalysis?: TarotAnalysis[];
  summary?: string;
  analysis?: string;
  followUpQuestions?: string[];
  followUpAnswers?: any;
  finalReport?: string;
}

export interface UserStatus {
  userId: string;
  recentWorry: string;
  feeling: string;
}

export interface DreamInterpretationRequest {
  content: string;
  type: DreamType;
  userStatus?: {
    recentWorry?: string;
    feeling?: string;
  };
}

export interface DreamInterpretationResponse {
  success: boolean;
  data?: DreamLog;
  error?: string;
}
