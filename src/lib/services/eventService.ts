import { tenantDb } from "@/lib/db/tenantDb"
import { events , clients} from "@/db/schema"
import { and, eq, isNotNull } from "drizzle-orm"
import { CreateEventInput,UpdateEventInput } from "@/lib/validations/eventValidation"
/* ---------- CREATE ---------- */

export async function createEvent(data: CreateEventInput) {
  const tdb = await tenantDb()

  const client = await tdb.findFirst(
    clients,
    eq(clients.id, data.clientId)
  )

  if (!client) {
    throw new Error("client not found")
  }

  const [result] = await tdb.insert(events, data)

  const insertId = result.insertId

  return tdb.findFirst(events, eq(events.id, insertId))
}

/* ---------- GET ALL ---------- */

export async function getEvents(clientId?: string | null) {
  const tdb = await tenantDb()

  if (clientId) {
    return await tdb.findManyRaw(
      events,
      eq(events.clientId, Number(clientId))
    )
  }

  return await tdb.findManyRaw(events)
}
/* ---------- GET BY ID ---------- */

export async function getEventById(id: number) {
  const tdb = await tenantDb()

  return await tdb.findFirstRaw(events, eq(events.id, id))
}

/* ---------- UPDATE ---------- */
export async function updateEvent(
  id: number,
  data: UpdateEventInput
) {
  const tdb = await tenantDb()

  /* check exists */
  const existing = await tdb.findFirst(
    events,
    eq(events.id, id)
  )

  if (!existing) return null

  /* update */
  await tdb.update(
    events,
    data,
    eq(events.id, id)
  )

  /* return updated */
  return tdb.findFirst(
    events,
    eq(events.id, id)
  )
}

/* ---------- UPDATE EVENT ---------- */

/* ---------- SOFT DELETE ---------- */

export async function deleteEvent(id: number) {
  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    events,
    eq(events.id, id)
  )

  if (!existing) return null

  await tdb.update(
    events,
    { deletedAt: new Date() },
    eq(events.id, id)
  )

  return true
}

/* ---------- REACTIVATE ---------- */

export async function reactivateEvent(id: number) {
  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    events,
    and(
      eq(events.id, id),
      isNotNull(events.deletedAt)
    )
  )

  if (!existing) return null

  await tdb.update(
    events,
    { deletedAt: null },
    eq(events.id, id)
  )

  return true
}