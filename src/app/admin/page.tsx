import { requireAuth } from "@/lib/auth/requireAuth"
import { db } from "@/db"
import { companies } from "@/db/schema"

export default async function AdminDashboard() {
  const auth = await requireAuth({ roles: ["admin"] })

  const companiesList = await db.select().from(companies)

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
      <pre>{JSON.stringify(companiesList, null, 2)}</pre>
    </div>
  )
}