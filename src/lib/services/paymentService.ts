import { tenantDb } from "@/lib/db/tenantDb"

import {
  payments,
  contracts
} from "@/db/schema"

import { eq } from "drizzle-orm"

import type {
  CreatePaymentInput
} from "@/lib/validations/paymentValidation"



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

  const insertId = result.insertId

  return tdb.findFirst(
    payments,
    eq(payments.id, insertId)
  )

}