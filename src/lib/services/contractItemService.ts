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

  /* existing item */

  const existingItem = await tdb.findFirstRaw(
    contractItems,
    and(
      eq(contractItems.contractId, contractId),
      eq(contractItems.serviceId, data.serviceId)
    )
  )

  const used = existingItem ? existingItem.quantity : 0

  if (
    service.stockTotal !== null &&
    used + data.quantity > service.stockTotal
  ) {
    throw new Error("not enough stock")
  }

  /* update existing */

  if (existingItem) {

    const newQuantity =
      (existingItem.quantity ?? 0) + data.quantity

    await tdb.update(
      contractItems,
      { quantity: newQuantity },
      eq(contractItems.id, existingItem.id)
    )

    await recalculateContractTotal(contractId)

    return tdb.findFirst(
      contractItems,
      eq(contractItems.id, existingItem.id)
    )

  }

  /* insert item */

  const [result] = await tdb.insert(contractItems, {
    contractId,
    serviceId: data.serviceId,
    quantity: data.quantity,
    unitPrice: data.unitPrice ?? service.priceBase
  })

  const insertId = result.insertId

  await recalculateContractTotal(contractId)

  return tdb.findFirst(
    contractItems,
    eq(contractItems.id, insertId)
  )

}

/* ---------- GET CONTRACT SERVICES ---------- */

export async function getContractServices(contractId: number) {

  const tdb = await tenantDb()

  return tdb.findMany(
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

  await recalculateContractTotal(existing.contractId)

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

  await recalculateContractTotal(existing.contractId)

  return true
}


/* ---------- RECALCULATE CONTRACT TOTAL ---------- */

async function recalculateContractTotal(contractId: number) {

  const tdb = await tenantDb()

  const items = await tdb.findManyRaw(
    contractItems,
    eq(contractItems.contractId, contractId)
  )

  const total = items.reduce((sum, item) => {
    return sum + (item.quantity * Number(item.unitPrice))
  }, 0)

  await tdb.update(
    contracts,
    { totalAmount: total },
    eq(contracts.id, contractId)
  )

}