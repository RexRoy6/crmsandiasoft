import { tenantDb } from "@/lib/db/tenantDb"

import {
  clients,
  events,
  contracts,
  payments
} from "@/db/schema"

import { eq, sql, count, sum } from "drizzle-orm"



export async function getCompanyDashboard() {

  const tdb = await tenantDb()

  /* ---------- CLIENT COUNT ---------- */

  const [clientsResult] = await tdb.count(clients)

  const clientsCount = clientsResult.count



  /* ---------- EVENTS COUNT ---------- */

  const [eventsResult] = await tdb.count(events)

  const eventsCount = eventsResult.count

  /* ---------- ACTIVE CONTRACTS ---------- */

  const [contractsResult] = await tdb.count(
    contracts,
    eq(contracts.status, "active")
  )

  const activeContracts = contractsResult.count
  /* ---------- REVENUE THIS MONTH ---------- */


  const [paymentsTotalResult] = await tdb.sum(
    payments,
    payments.amount
  )
  const revenueThisMonth = 0

  const totalPaid =
    Number(paymentsTotalResult.total ?? 0)

  /* ---------- PENDING PAYMENTS ---------- */

  const [contractsTotalResult] = await tdb.sum(
    contracts,
    contracts.totalAmount
  )

  const totalContracts =
    Number(contractsTotalResult.total ?? 0)

  const pendingPayments = totalContracts - totalPaid


  return {
    clients: clientsCount,
    events: eventsCount,
    contractsActive: activeContracts,
    revenueThisMonth,
    pendingPayments
  }

}