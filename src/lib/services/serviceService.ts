import { tenantDb } from "@/lib/db/tenantDb"
import { services } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { UpdateServiceInput } from "@/lib/validations/serviceValidation"
// export async function createService(data: {
//   name: string
//   description?: string
//   stockTotal: number
//   priceBase: string
// }) {
//   const tdb = await tenantDb()

//   return tdb.insert(services, data)
// }

export async function createService(data: {
  name: string
  description?: string
  stockTotal: number
  priceBase: string
}) {
  const tdb = await tenantDb()

  /* ---------- insert ---------- */
  const [result] = await tdb.insert(services,data)

  const insertId = result.insertId

  /* ---------- fetch created row ---------- */
  const created = await tdb.findFirst(
    services,
    eq(services.id, insertId)
  )

  return created
}

export async function getCompanyServices() {
  const tdb = await tenantDb()
  return tdb.findMany(services)
}

export async function updateService(id: number, data: UpdateServiceInput) {
  const tdb = await tenantDb()

  return tdb.update(
    services,
    data,
    eq(services.id, id)
  )
}

export async function deleteService(id: number) {
  const tdb = await tenantDb()

  return tdb.update(
    services,
    { deletedAt: new Date() },
    eq(services.id, id)
  )
}