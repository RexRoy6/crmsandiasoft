import { db } from "@/db"
import { getAuthContext } from "@/lib/auth/getAuthContext"
import { tenantDb } from "@/lib/db/tenantDb"

import {
  payments,
  contracts,clients, events
} from "@/db/schema"

import { eq,and, isNull } from "drizzle-orm"

import type {
  CreatePaymentInput
} from "@/lib/validations/paymentValidation"


async function recalcContractStatus(contractId: number) {

  const tdb = await tenantDb()

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, contractId)
  )

  if (!contract) return

  const contractPayments =
    await tdb.findManyRaw(
      payments,
      eq(payments.contractId, contractId)
    )

  const paidAmount = contractPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const total = Number(contract.totalAmount)

  let newStatus = contract.status

  if (paidAmount === 0) {
    newStatus = "draft"
  } else if (paidAmount < total) {
    newStatus = "partial"
  } else {
    newStatus = "paid"
  }

  await tdb.update(
    contracts,
    { status: newStatus },
    eq(contracts.id, contractId)
  )
}

/* ---------- GET CONTRACT PAYMENTS ---------- */

export async function getContractPayments(
  contractId: number
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

  /* get payments */

  const contractPayments =
    await tdb.findMany(
      payments,
      eq(payments.contractId, contractId)
    )

  /* calculate totals */

  const paidAmount = contractPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const contractTotal = Number(contract.totalAmount)

  const remainingAmount = contractTotal - paidAmount

  return {
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

  /* contract exists */

  const contract = await tdb.findFirst(
    contracts,
    eq(contracts.id, contractId)
  )

  if (!contract) {
    throw new Error("contract not found")
  }

  /* get existing payments */

  const existingPayments =
    await tdb.findManyRaw(
      payments,
      eq(payments.contractId, contractId)
    )

  const paid = existingPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const total = Number(contract.totalAmount)

  if (paid + data.amount > total) {
    throw new Error("payment exceeds contract total")
  }

  /* insert payment */

  const [result] = await tdb.insert(payments, {
    contractId,
    amount: data.amount,
    currency: data.currency,
    paymentMethod: data.paymentMethod
  })

  // const insertId = result.insertId

  // return tdb.findFirst(
  //   payments,
  //   eq(payments.id, insertId)
  // )
  const insertId = result.insertId

  /* recalculate totals */

  const updatedPayments =
    await tdb.findManyRaw(
      payments,
      eq(payments.contractId, contractId)
    )

  const paidAmount = updatedPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const contractTotal = Number(contract.totalAmount)

  let newStatus = contract.status

  if (paidAmount === contractTotal) {
    newStatus = "paid"
  } else if (paidAmount > 0) {
    newStatus = "partial"
  }

  /* update contract status */

  await tdb.update(
    contracts,
    { status: newStatus },
    eq(contracts.id, contractId)
  )
  //await recalcContractStatus(contractId)

  return tdb.findFirst(
    payments,
    eq(payments.id, insertId)
  )

}

export async function getCompanyPayments() {

  const { companyId } = await getAuthContext()

  const rows = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      paymentMethod: payments.paymentMethod,
      createdAt: payments.createdAt,

      contractId: contracts.id,

      clientName: clients.name,
      eventName: events.name
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

  return rows
}
/* ---------- GET SINGLE PAYMENT ---------- */

export async function getPayment(id: number) {

  const tdb = await tenantDb()

  return tdb.findFirstRaw(
    payments,
    eq(payments.id, id)
  )

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