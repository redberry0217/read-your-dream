export type User = {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  silver: number;      // 은자
  gold: number;        // 금자
  jewels?: number;     // 하위 호환
  referralCode?: string;
  lastAttendance?: string;
};

export type ChargeJewelResponse = {
  success: boolean;
  silver: number;
  gold: number;
  jewels: number;
  message: string;
};
