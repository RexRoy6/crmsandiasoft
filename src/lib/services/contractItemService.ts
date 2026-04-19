import { tenantDb } from "@/lib/db/tenantDb"

import {
  contractItems,
  services,
  contracts,
    payments,
  paymentItems
} from "@/db/schema"

import { eq, and ,isNull } from "drizzle-orm"

import type {
  CreateContractItemInput,
  UpdateContractItemInput
} from "@/lib/validations/contractItemValidation"

import { db } from "@/db"
import { getAuthContext } from "@/lib/auth/getAuthContext"


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

  const existingItem = await tdb.findFirst(
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
    const available = service.stockTotal - used

    const error: any = new Error("not enough stock")
    error.code = "STOCK_EXCEEDED"
    error.available = available

    throw error
  }

  /* update existing */

  if (existingItem) {

    const newQuantity =
      (existingItem.quantity ?? 0) + data.quantity

    await tdb.update(
      contractItems,
      { quantity: newQuantity,
        ...(data.serviceNotes && { serviceNotes: data.serviceNotes })
       },
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
    unitPrice: data.unitPrice ?? service.priceBase,
    serviceNotes: data.serviceNotes ?? null,

    operationStart: data.operationStart
    ? new Date(data.operationStart)
    : null,

  operationEnd: data.operationEnd
    ? new Date(data.operationEnd)
    : null,


  })

  const insertId = result.insertId

  await recalculateContractTotal(contractId)

  return tdb.findFirst(
    contractItems,
    eq(contractItems.id, insertId)
  )

}

/* ---------- GET CONTRACT SERVICES ---------- */

// export async function getContractServices(contractId: number) {

//   const tdb = await tenantDb()

//   return tdb.findMany(
//     contractItems,
//     eq(contractItems.contractId, contractId)
//   )

// }

/* ---------- GET CONTRACT SERVICES ---------- */

export async function getContractServices(contractId: number) {

  const { companyId } = await getAuthContext()

  /* ---------- 1. CONTRACT ITEMS ---------- */

  const rows = await db
    .select({
      id: contractItems.id,
      contractId: contractItems.contractId,
      quantity: contractItems.quantity,
      unitPrice: contractItems.unitPrice,
      serviceNotes:contractItems.serviceNotes,
      operationStart:contractItems.operationStart,
      operationEnd:contractItems.operationEnd,

      serviceId: services.id,
      serviceName: services.name,
      serviceDescription: services.description
    })
    .from(contractItems)

    .innerJoin(
      contracts,
      eq(contractItems.contractId, contracts.id)
    )

    .innerJoin(
      services,
      eq(contractItems.serviceId, services.id)
    )

    .where(
      and(
        eq(contractItems.contractId, contractId),
        eq(contracts.companyId, companyId!),
        isNull(contractItems.deletedAt)
      )
    )

  /* ---------- 2. PAYMENT ITEMS (🔥 NUEVO) ---------- */

  const paymentItemsRows = await db
    .select({
      contractItemId: paymentItems.contractItemId,
      amount: paymentItems.amount
    })
    .from(paymentItems)
    .innerJoin(
      payments,
      eq(paymentItems.paymentId, payments.id)
    )
    .where(eq(payments.contractId, contractId))

  /* ---------- 3. AGRUPAR PAGOS POR ITEM (🔥 NUEVO) ---------- */

  const paidByItem = new Map<number, number>()

  for (const row of paymentItemsRows) {
    const current = paidByItem.get(row.contractItemId) || 0

    paidByItem.set(
      row.contractItemId,
      current + Number(row.amount)
    )
  }

  /* ---------- 4. ENRIQUECER RESULTADO (🔥 NUEVO) ---------- */

  return rows.map((row: any) => {

    const total =
      row.quantity * Number(row.unitPrice)

    const paid =
      paidByItem.get(row.id) || 0

    const remaining =
      total - paid

    return {
      id: row.id,
      contractId: row.contractId,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      serviceNotes:row.serviceNotes,
      operationStart:row.operationStart,
      operationEnd:row.operationEnd,

      paidAmount: paid,          
      remainingAmount: remaining, 

      service: {
        id: row.serviceId,
        name: row.serviceName,
        description: row.serviceDescription
      }
    }
  })
}

/* ---------- GET CONTRACT SERVICES ---------- */


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

  // await tdb.update(
  //   contractItems,
  //   data,
  //   eq(contractItems.id, id)
  // )
  await tdb.update(
  contractItems,
  {
    ...(data.serviceId && { serviceId: data.serviceId }),
    ...(data.quantity && { quantity: data.quantity }),
    ...(data.serviceNotes !== undefined && {
      serviceNotes: data.serviceNotes
    })
  },
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

  const items = await tdb.findMany(
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