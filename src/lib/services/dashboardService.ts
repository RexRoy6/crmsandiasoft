import { tenantDb } from "@/lib/db/tenantDb"

import {
  clients,
  events,
  contracts,
  payments
} from "@/db/schema"

import { eq, sql } from "drizzle-orm"



export async function getCompanyDashboard() {

  const tdb = await tenantDb()

  /* ---------- CLIENT COUNT ---------- */

  const clientsResult = await tdb.findMany(clients)

  const clientsCount = clientsResult.length


  /* ---------- EVENTS COUNT ---------- */

  const eventsResult = await tdb.findMany(events)

  const eventsCount = eventsResult.length


  /* ---------- ACTIVE CONTRACTS ---------- */

  const contractsResult = await tdb.findMany(
    contracts,
    eq(contracts.status, "active")
  )

  const activeContracts = contractsResult.length


  /* ---------- REVENUE THIS MONTH ---------- */

  const paymentsResult = await tdb.findManyRaw(payments)

  const now = new Date()

  const revenueThisMonth = paymentsResult
    .filter(p => {

      const created = new Date(p.createdAt)

      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      )

    })
    .reduce((sum, p) => sum + Number(p.amount), 0)


  /* ---------- PENDING PAYMENTS ---------- */

  const contractsAll = await tdb.findMany(contracts)

  const totalContracts = contractsAll.reduce(
    (sum, c) => sum + Number(c.totalAmount),
    0
  )

  const totalPaid = paymentsResult.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const pendingPayments = totalContracts - totalPaid


  return {
    clients: clientsCount,
    events: eventsCount,
    contractsActive: activeContracts,
    revenueThisMonth,
    pendingPayments
  }

}