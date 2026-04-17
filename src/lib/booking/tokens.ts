import { randomBytes } from "crypto";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function isValidTokenShape(token: string): boolean {
  return /^[0-9a-f]{64}$/.test(token);
}
