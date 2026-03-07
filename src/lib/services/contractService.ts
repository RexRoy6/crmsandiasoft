import { tenantDb } from "@/lib/db/tenantDb"
import { contracts,events } from "@/db/schema"

import { eq } from "drizzle-orm"

import type {
  CreateContractInput,
  UpdateContractInput
} from "@/lib/validations/contractValidation"



/* ---------- CREATE CONTRACT ---------- */

export async function createContract(data: CreateContractInput) {

  const tdb = await tenantDb()
  const event = await tdb.findFirst(
  events,
  eq(events.id, data.eventId)
)

if (!event) {
  throw new Error("event not found")
}

  const [result] = await tdb.insert(
    contracts,
    data
  )

  const insertId = result.insertId

  return tdb.findFirst(
    contracts,
    eq(contracts.id, insertId)
  )
}



/* ---------- GET COMPANY CONTRACTS ---------- */

export async function getCompanyContracts() {

  const tdb = await tenantDb()

  return tdb.findManyRaw(contracts)

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