import { SignJWT, jwtVerify, JWTPayload } from "jose"
import { UserRole } from "@/db/schema"

/* ---------- ENV VALIDATION ---------- */

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

/* ---------- TOKEN TYPE ---------- */

export interface AuthTokenPayload extends JWTPayload {
  userId: number
  companyId: number | null
  role: UserRole
}

/* ---------- SIGN ---------- */

export async function signToken(payload: AuthTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)
}

/* ---------- VERIFY ---------- */

export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as AuthTokenPayload
  } catch {
    throw new Error("Invalid token")
  }
}