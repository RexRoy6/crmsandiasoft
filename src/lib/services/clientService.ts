import { tenantDb } from "@/lib/db/tenantDb"
import { clients } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { UpdateClientInput } from "@/lib/validations/clientValidation"

//createClient
export async function createClient(data: {
  name: string
  phone: string
  email: string
}) {
  const tdb = await tenantDb()

  const [result] = await tdb.insert(clients, data)

  const id = result.insertId

  return tdb.findFirst(
    clients,
    eq(clients.id, id)
  )
}
//getClients
export async function getClients() {
  const tdb = await tenantDb()
  return tdb.findManyRaw(clients)
}
//getClient
export async function getClient(id: number) {
  const tdb = await tenantDb()

  return tdb.findFirst(
    clients,
    eq(clients.id, id)
  )
}
//updateClient
export async function updateClient(
  id: number,
  data: UpdateClientInput
) {
  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    clients,
    eq(clients.id, id)
  )

  if (!existing) return null

  await tdb.update(
    clients,
    data,
    eq(clients.id, id)
  )

  return tdb.findFirst(
    clients,
    eq(clients.id, id)
  )
}
//deleteClient (soft delete)
export async function deleteClient(id: number) {
  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    clients,
    eq(clients.id, id)
  )

  if (!existing) return null

  await tdb.update(
    clients,
    { deletedAt: new Date() },
    eq(clients.id, id)
  )

  return true
}

//reactivar usuario
//reactivateClient
export async function reactivateClient(id: number) {
  const tdb = await tenantDb()

  /* buscar incluso si esta soft deleted */
  const existing = await tdb.findFirstRaw(
    clients,
    eq(clients.id, id)
  )

  if (!existing) return null

  await tdb.update(
    clients,
    { deletedAt: null },
    eq(clients.id, id)
  )

  return true
}