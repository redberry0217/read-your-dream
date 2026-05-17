export type User = {
  id: string;
  email: string;
  name: string;
  jewels: number;
};

export type ChargeJewelResponse = {
  success: boolean;
  jewels: number;
  message: string;
};
