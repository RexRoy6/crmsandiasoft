import { SignJWT, jwtVerify, JWTPayload } from "jose"
import { UserRole } from "@/db/schema"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

/* ---------- TOKEN TYPE ---------- */

export interface AuthTokenPayload extends JWTPayload {
  userId: number
  companyId: number | null
  //role: string
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
  const { payload } = await jwtVerify(token, secret)
  return payload as AuthTokenPayload
}