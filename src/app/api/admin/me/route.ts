import { requireAuth } from "@/lib/auth/requireAuth"

export async function GET() {
  try {
    const auth = await requireAuth()

    return Response.json(auth)
  } catch {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
}