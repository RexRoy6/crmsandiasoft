import jwt from "jsonwebtoken"
import { JwtPayload } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

/* ---------- TOKEN TYPE ---------- */

export interface AuthTokenPayload extends JwtPayload {
  userId: number
  companyId: number
  role: string
}

/* ---------- SIGN ---------- */

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d"
  })
}

/* ---------- VERIFY ---------- */

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload
}