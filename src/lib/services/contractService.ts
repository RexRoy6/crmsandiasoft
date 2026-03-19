import { db } from "@/db"
import { tenantDb } from "@/lib/db/tenantDb"
import { getAuthContext } from "@/lib/auth/getAuthContext"
import { contracts, events, clients, payments } from "@/db/schema"
import { sql } from "drizzle-orm"

import { eq, and, isNull } from "drizzle-orm"

import type {
  CreateContractInput,
  UpdateContractInput
} from "@/lib/validations/contractValidation"



/* ---------- CREATE CONTRACT ---------- */
// export async function createContract(data: CreateContractInput) {

//   const tdb = await tenantDb()

//   const event = await tdb.findFirst(
//     events,
//     eq(events.id, data.eventId)
//   )

//   if (!event) {
//     throw new Error("Event not found")
//   }

//   const [result] = await tdb.insert(
//     contracts,
//     {
//       eventId: data.eventId,
//       clientId: event.clientId,   //clave
//       status: data.status,
//       totalAmount: data.totalAmount
//     }
//   )

//   const insertId = result.insertId

//   return tdb.findFirst(
//     contracts,
//     eq(contracts.id, insertId)
//   )
// }
export async function createContract(data: CreateContractInput) {
  const tdb = await tenantDb()

  const event = await tdb.findFirst(
    events,
    eq(events.id, data.eventId)
  )

  if (!event) {
    throw new Error("Event not found")
  }

  // 🔥 check si ya existe contrato
  const existing = await tdb.findFirst(
    contracts,
    and(
      eq(contracts.eventId, data.eventId),
      eq(contracts.companyId, event.companyId)
    )
  )

  if (existing) {
    return existing // o throw error si prefieres
  }

  const [result] = await tdb.insert(
    contracts,
    {
      eventId: data.eventId,
      clientId: event.clientId,
      status: data.status,
      totalAmount: data.totalAmount
    }
  )

  return tdb.findFirst(
    contracts,
    eq(contracts.id, result.insertId)
  )
}


/* ---------- GET COMPANY CONTRACTS ---------- */

// export async function getCompanyContracts() {

//   const tdb = await tenantDb()

//   return tdb.findManyRaw(contracts)

// }
export async function getCompanyContracts() {

  const { companyId } = await getAuthContext()

  const rows = await db
    // .select({
    //   id: contracts.id,
    //   status: contracts.status,
    //   totalAmount: contracts.totalAmount,

    //   clientId: clients.id,
    //   clientName: clients.name,

    //   eventId: events.id,
    //   eventName: events.name
    // })


    // .from(contracts)
    // .leftJoin(
    //   clients,
    //   eq(contracts.clientId, clients.id)
    // )
    // .leftJoin(
    //   events,
    //   eq(contracts.eventId, events.id)
    // )
    // .where(
    //   companyId
    //     ? and(
    //       eq(contracts.companyId, companyId),
    //       isNull(contracts.deletedAt)
    //     )
    //     : isNull(contracts.deletedAt)
    // )

    .select({
      id: contracts.id,
      status: contracts.status,
      totalAmount: contracts.totalAmount,

      paidAmount: sql<number>`COALESCE(SUM(${payments.amount}),0)`,

      clientId: clients.id,
      clientName: clients.name,

      eventId: events.id,
      eventName: events.name
    })
    .from(contracts)

    .leftJoin(
      clients,
      eq(contracts.clientId, clients.id)
    )

    .leftJoin(
      events,
      eq(contracts.eventId, events.id)
    )

    .leftJoin(
      payments,
      eq(payments.contractId, contracts.id)
    )

    .where(
      companyId
        ? and(
          eq(contracts.companyId, companyId),
          isNull(contracts.deletedAt)
        )
        : isNull(contracts.deletedAt)
    )

    .groupBy(
      contracts.id,
      clients.id,
      events.id
    )

  // return rows.map((row) => ({
  //   id: row.id,
  //   status: row.status,
  //   totalAmount: row.totalAmount,

  //   client: row.clientId
  //     ? {
  //       id: row.clientId,
  //       name: row.clientName
  //     }
  //     : null,

  //   event: row.eventId
  //     ? {
  //       id: row.eventId,
  //       name: row.eventName
  //     }
  //     : null
  // }))
  return rows.map((row) => {

    const total = Number(row.totalAmount)
    const paid = Number(row.paidAmount)

    return {
      id: row.id,
      status: row.status,
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: total - paid,

      client: row.clientId
        ? {
          id: row.clientId,
          name: row.clientName
        }
        : null,

      event: row.eventId
        ? {
          id: row.eventId,
          name: row.eventName
        }
        : null
    }

  })
}



/* ---------- GET SINGLE CONTRACT ---------- */

export async function getContract(id: number) {

  const tdb = await tenantDb()

  return tdb.findFirst(
    contracts,
    eq(contracts.id, id)
  )

}



/* ---------- UPDATE CONTRACT ---------- */

export async function updateContract(
  id: number,
  data: UpdateContractInput
) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    contracts,
    eq(contracts.id, id)
  )

  if (!existing) return null

  await tdb.update(
    contracts,
    data,
    eq(contracts.id, id)
  )

  return tdb.findFirst(
    contracts,
    eq(contracts.id, id)
  )

}



/* ---------- SOFT DELETE ---------- */

export async function deleteContract(id: number) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    contracts,
    eq(contracts.id, id)
  )

  if (!existing) return null

  await tdb.update(
    contracts,
    { deletedAt: new Date() },
    eq(contracts.id, id)
  )

  return true

}



/* ---------- REACTIVATE ---------- */

export async function reactivateContract(id: number) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    contracts,
    eq(contracts.id, id)
  )

  if (!existing) return null

  await tdb.update(
    contracts,
    { deletedAt: null },
    eq(contracts.id, id)
  )

  return true

}