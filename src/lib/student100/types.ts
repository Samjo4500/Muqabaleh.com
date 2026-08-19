export type Student100PublicStatus = {
  available: boolean;
  open: boolean;
  startAt: string;
  cap: number;
  reserved: number;
  remaining: number;
  soldOut: boolean;
};

export type Student100Mine = {
  status: string;
  creditsRemaining: number;
  expiresAt: string | null;
} | null;
