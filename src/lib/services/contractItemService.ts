import { tenantDb } from "@/lib/db/tenantDb"

import {
  contractItems,
  services,
  contracts
} from "@/db/schema"

import { eq, and } from "drizzle-orm"

import type {
  CreateContractItemInput,
  UpdateContractItemInput
} from "@/lib/validations/contractItemValidation"



/* ---------- ADD SERVICE TO CONTRACT ---------- */

export async function addServiceToContract(
  contractId: number,
  data: CreateContractItemInput
) {

  const tdb = await tenantDb()

  /* contract exists */

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, contractId)
  )

  if (!contract) {
    throw new Error("contract not found")
  }

  /* service exists */

  const service = await tdb.findFirst(
    services,
    eq(services.id, data.serviceId)
  )

  if (!service) {
    throw new Error("service not found")
  }

  /* inventory validation */

  if (data.quantity > service.stockTotal) {
    throw new Error("not enough stock")
  }

  /* insert item */

  const [result] = await tdb.insert(contractItems, {
    contractId,
    serviceId: data.serviceId,
    quantity: data.quantity,
    unitPrice: service.priceBase
  })

  const insertId = result.insertId

  return tdb.findFirst(
    contractItems,
    eq(contractItems.id, insertId)
  )
}



/* ---------- GET CONTRACT SERVICES ---------- */

export async function getContractServices(contractId: number) {

  const tdb = await tenantDb()

  return tdb.findManyRaw(
    contractItems,
    eq(contractItems.contractId, contractId)
  )

}



/* ---------- UPDATE ITEM ---------- */

export async function updateContractItem(
  id: number,
  data: UpdateContractItemInput
) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    contractItems,
    eq(contractItems.id, id)
  )

  if (!existing) return null

  await tdb.update(
    contractItems,
    data,
    eq(contractItems.id, id)
  )

  return tdb.findFirst(
    contractItems,
    eq(contractItems.id, id)
  )
}



/* ---------- DELETE ITEM ---------- */

export async function deleteContractItem(id: number) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirst(
    contractItems,
    eq(contractItems.id, id)
  )

  if (!existing) return null

  await tdb.update(
    contractItems,
    { deletedAt: new Date() },
    eq(contractItems.id, id)
  )

  return true
}