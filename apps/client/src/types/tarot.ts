export type MyTarot = {
  name: string;
  drawnCount: number;
  lastDrawnAt: string;
  details: {
    status: string;
    meaning: string;
    advice: string;
  };
};
