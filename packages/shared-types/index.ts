export interface User {
  id: string;
  email: string;
  jewels: number;
}

export type DreamType = 'FREE' | 'PREMIUM';

export interface Emotions {
  joy: number;
  anger: number;
  sadness: number;
  fear: number;
  love: number;
  disgust: number;
  desire: number;
}

export interface DreamLog {
  id: string;
  content: string;
  emotions: Emotions;
  type: DreamType;
  createdAt: string;
  tarotCards?: string[];
  summary?: string;
  analysis?: string;
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
