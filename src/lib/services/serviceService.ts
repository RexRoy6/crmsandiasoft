import { tenantDb } from "@/lib/db/tenantDb"
import { services } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function createService(data: {
  name: string
  description?: string
  stockTotal: number
  priceBase: string
}) {
  const tdb = await tenantDb()

  return tdb.insert(services, data)
}

export async function getCompanyServices() {
  const tdb = await tenantDb()
  return tdb.findMany(services)
}

export async function updateService(id: number, data: any) {
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