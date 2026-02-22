import { tenantDb } from "@/lib/db/tenantDb"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getAuthContext } from "@/lib/auth/getAuthContext"

export async function GET() {
  /* contexto del usuario autenticado */
  const auth = await getAuthContext()

  /* tenant db */
  const tdb = await tenantDb()

  /* buscar usuario dentro de su tenant */
  const user = await tdb.findFirst(
    users,
    eq(users.id, auth.userId)
  )

  return Response.json({
    success: true,
    authContext: auth,
    user
  })
}