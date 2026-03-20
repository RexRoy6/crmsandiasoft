import { db } from "@/db"
import { getAuthContext } from "@/lib/auth/getAuthContext"
import { tenantDb } from "@/lib/db/tenantDb"
import { paymentItems, contractItems as contractItemsTable } from "@/db/schema"
import {
  payments,
  contracts, clients, events
} from "@/db/schema"

import { eq, and, isNull, sum } from "drizzle-orm"

import type {
  CreatePaymentInput
} from "@/lib/validations/paymentValidation"


function getPaymentStatus(total: number, paid: number) {

  if (paid === 0) return "unpaid"

  if (paid < total) return "partial"

  return "paid"

}

/* ---------- GET CONTRACT PAYMENTS ---------- */
export async function getContractPayments(
  contractId: number
) {

  const tdb = await tenantDb()

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, contractId)
  )

  if (!contract) {
    throw new Error("contract not found")
  }

  const contractPayments =
    await tdb.findMany(
      payments,
      eq(payments.contractId, contractId)
    )

  const paidAmount = contractPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const contractTotal = Number(contract.totalAmount)

  const remainingAmount = contractTotal - paidAmount

  const paymentStatus = getPaymentStatus(
    contractTotal,
    paidAmount
  )

  return {
    contractId: contract.id,
    contractStatus: contract.status,
    paymentStatus,
    contractTotal,
    paidAmount,
    remainingAmount,
    payments: contractPayments
  }

}



/* ---------- CREATE PAYMENT ---------- */
export async function createPayment(
  contractId: number,
  data: CreatePaymentInput
) {

  const tdb = await tenantDb()

  /* ---------- 1. contract exists ---------- */

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, contractId)
  )

  if (!contract) {
    throw new Error("contract not found")
  }

  /* ---------- 2. calcular total desde items ---------- */

  const total = data.items.reduce(
    (sum, item) => sum + item.amount,
    0
  )

  /* ---------- 3. obtener pagos actuales ---------- */

  const existingPayments =
    await tdb.findManyRaw(
      payments,
      eq(payments.contractId, contractId)
    )

  const paid = existingPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const contractTotal = Number(contract.totalAmount)

  if (paid + total > contractTotal) {
    throw new Error("payment exceeds contract total")
  }

  /* ---------- 4. validar contract items ---------- */

  const contractItems =
    await tdb.findMany(
      contractItemsTable,
      eq(contractItemsTable.contractId, contractId)
    )

  for (const item of data.items) {

    const contractItem = contractItems.find(
      ci => ci.id === item.contractItemId
    )

    if (!contractItem) {
      throw new Error("invalid contract item")
    }

    // 🔥 FASE 2: aquí después validaremos remaining por item
  }

  /* ---------- 5. TRANSACTION 🔥 ---------- */

  let paymentId: number | null = null

  await db.transaction(async (tx) => {

    /* crear payment */

    const result = await tx.insert(payments).values({
      contractId,
      amount: total.toString(),
      currency: data.currency,
      paymentMethod: data.paymentMethod
    })

    const paymentId = result[0].insertId

    //paymentId = paymentResult.insertId

    /* insertar payment_items */
    await tx.insert(paymentItems).values(
      data.items.map(item => ({
        paymentId: paymentId!,
        contractItemId: item.contractItemId,
        amount: item.amount.toString()
      }))
    )

  })

  /* ---------- 6. recalcular status ---------- */

  const newPaidAmount = paid + total

  let newStatus = contract.status

  if (newPaidAmount === 0) {
    newStatus = "draft"
  }
  else if (newPaidAmount < contractTotal) {
    newStatus = "active"
  }
  else if (newPaidAmount >= contractTotal) {
    newStatus = "completed"
  }

  await tdb.update(
    contracts,
    { status: newStatus },
    and(
      eq(contracts.id, contractId),
      eq(contracts.companyId, contract.companyId)
    )
  )

  /* ---------- 7. return payment ---------- */

  if (!paymentId) return null

  return tdb.findFirst(
    payments,
    eq(payments.id, paymentId)
  )
}

export async function getCompanyPayments() {

  const { companyId } = await getAuthContext()

  const rows = await db
    .select({
      paymentId: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      paymentMethod: payments.paymentMethod,
      createdAt: payments.createdAt,

      contractId: contracts.id,
      contractStatus: contracts.status,
      contractTotal: contracts.totalAmount,

      clientName: clients.name,
      eventName: events.name,

      paidAmount: sum(payments.amount)
    })
    .from(payments)
    .leftJoin(
      contracts,
      eq(payments.contractId, contracts.id)
    )
    .leftJoin(
      events,
      eq(contracts.eventId, events.id)
    )
    .leftJoin(
      clients,
      eq(contracts.clientId, clients.id)
    )
    .where(
      and(
        eq(contracts.companyId, companyId!),
        isNull(payments.deletedAt)
      )
    )
    .groupBy(
      payments.id,
      contracts.id,
      clients.name,
      events.name
    )

  /* calcular remaining + status */

  return rows.map((row) => {

    const contractTotal = Number(row.contractTotal)

    const paidAmount = Number(row.paidAmount ?? 0)

    const remainingAmount = contractTotal - paidAmount

    const paymentStatus =
      getPaymentStatus(contractTotal, paidAmount)

    return {
      ...row,
      contractTotal,
      paidAmount,
      remainingAmount,
      paymentStatus
    }

  })

}
/* ---------- GET SINGLE PAYMENT ---------- */

export async function getPayment(id: number) {

  const tdb = await tenantDb()

  const payment = await tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )

  if (!payment) return null

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, payment.contractId)
  )

  if (!contract) return null

  const contractPayments =
    await tdb.findMany(
      payments,
      eq(payments.contractId, payment.contractId)
    )

  const paidAmount = contractPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const contractTotal = Number(contract.totalAmount)

  const remainingAmount = contractTotal - paidAmount

  const paymentStatus =
    getPaymentStatus(contractTotal, paidAmount)

  return {
    contractId: contract.id,
    contractStatus: contract.status,
    paymentStatus,
    contractTotal,
    paidAmount,
    remainingAmount,
    payments: contractPayments
  }

}
export async function updatePayment(
  id: number,
  data: Partial<CreatePaymentInput>
) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )

  if (!existing) return null

  await tdb.update(
    payments,
    data,
    eq(payments.id, id)
  )

  //await recalcContractStatus(existing.contractId)

  return tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )
}
export async function deletePayment(id: number) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )

  if (!existing) return null

  await tdb.update(
    payments,
    { deletedAt: new Date() },
    eq(payments.id, id)
  )

  //await recalcContractStatus(existing.contractId)

  return true
}
export async function reactivatePayment(id: number) {

  const tdb = await tenantDb()

  const existing = await tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )

  if (!existing) return null

  await tdb.update(
    payments,
    { deletedAt: null },
    eq(payments.id, id)
  )

  //await recalcContractStatus(existing.contractId)

  return true
}