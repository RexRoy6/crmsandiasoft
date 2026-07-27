import { tenantDb } from "@/lib/db/tenantDb"

import {
  clients,
  events,
  contracts,
  payments
} from "@/db/schema"

import { eq } from "drizzle-orm"

export async function getCompanyDashboard() {

  const tdb = await tenantDb()

  /* ---------- CLIENT COUNT ---------- */
  //forma vieja de contar
  // const [clientsResult] = await tdb.count(clients)

  // const clientsCount = clientsResult.count
  const clientsCount = await tdb.count(clients)

  /* ---------- EVENTS COUNT ---------- */
  const eventsCount = await tdb.count(events)

  /* ---------- ACTIVE CONTRACTS ---------- */

  const activeContracts = await tdb.count(contracts,
    eq(contracts.status, "active"))
  /* ---------- REVENUE THIS MONTH ---------- */

  const revenueThisMonth = 0

  const totalPaid = await tdb.sum(
    payments,
    payments.amount
  )

  /* ---------- PENDING PAYMENTS ---------- */

  const totalContracts = await tdb.sum(contracts, contracts.totalAmount)

  const pendingPayments = totalContracts - totalPaid

  return {
    clients: clientsCount,
    events: eventsCount,
    contractsActive: activeContracts,
    revenueThisMonth,
    pendingPayments
  }

}