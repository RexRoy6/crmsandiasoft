import {
  mysqlTable,
  bigint,
  varchar,
  int,
  decimal,
  date,
  timestamp,
  index
} from "drizzle-orm/mysql-core"

/* =======================================================
   BASE COLUMNS (soft delete + auditoría base)
======================================================= */

const baseColumns = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  deletedAt: timestamp("deleted_at")
}

/* =======================================================
   COMPANIES (tenant root)
======================================================= */

export const companies = mysqlTable("companies", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  name: varchar("name",{length:255}).notNull(),

  ...baseColumns
})

/* =======================================================
   USERS (multi-tenant security layer)
======================================================= */

export const users = mysqlTable("users",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  companyId: bigint("company_id",{mode:"number"}).notNull(),

  role: varchar("role",{length:50}).notNull(),

  email: varchar("email",{length:255}).notNull(),

  passwordHash: varchar("password_hash",{length:255}).notNull(),

  ...baseColumns
},
(table)=>({
  companyIdx: index("users_company_idx").on(table.companyId),
  emailIdx: index("users_email_idx").on(table.email)
}))

/* =======================================================
   CLIENTS
======================================================= */

export const clients = mysqlTable("clients",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  companyId: bigint("company_id",{mode:"number"}).notNull(),

  userId: bigint("user_id",{mode:"number"}),

  ...baseColumns
},
(table)=>({
  companyIdx: index("clients_company_idx").on(table.companyId)
}))

/* =======================================================
   SERVICES (inventario por empresa)
======================================================= */

export const services = mysqlTable("services",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  companyId: bigint("company_id",{mode:"number"}).notNull(),

  stockTotal: int("stock_total").notNull(),

  priceBase: decimal("price_base",{precision:10,scale:2}).notNull(),

  ...baseColumns
},
(table)=>({
  companyIdx: index("services_company_idx").on(table.companyId)
}))

/* =======================================================
   CONTRACTS (core del negocio)
======================================================= */

export const contracts = mysqlTable("contracts",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  companyId: bigint("company_id",{mode:"number"}).notNull(),

  clientId: bigint("client_id",{mode:"number"}).notNull(),

  eventDate: date("event_date").notNull(),

  status: varchar("status",{length:50}).notNull(),

  totalAmount: decimal("total_amount",{precision:12,scale:2}).notNull(),

  ...baseColumns
},
(table)=>({
  companyIdx: index("contracts_company_idx").on(table.companyId),
  eventIdx: index("contracts_event_idx").on(table.eventDate)
}))

/* =======================================================
   CONTRACT ITEMS (snapshot de servicios)
======================================================= */

export const contractItems = mysqlTable("contract_items",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  contractId: bigint("contract_id",{mode:"number"}).notNull(),

  serviceId: bigint("service_id",{mode:"number"}).notNull(),

  quantity: int("quantity").notNull(),

  ...baseColumns
},
(table)=>({
  contractIdx: index("contract_items_contract_idx").on(table.contractId),
  serviceIdx: index("contract_items_service_idx").on(table.serviceId)
}))

/* =======================================================
   PAYMENTS
======================================================= */

export const payments = mysqlTable("payments",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  contractId: bigint("contract_id",{mode:"number"}).notNull(),

  amount: decimal("amount",{precision:12,scale:2}).notNull(),

  ...baseColumns
},
(table)=>({
  contractIdx: index("payments_contract_idx").on(table.contractId)
}))

/* =======================================================
   REFUNDS
======================================================= */

export const refunds = mysqlTable("refunds",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  paymentId: bigint("payment_id",{mode:"number"}).notNull(),

  ...baseColumns
},
(table)=>({
  paymentIdx: index("refunds_payment_idx").on(table.paymentId)
}))

/* =======================================================
   CONTRACT HISTORY (auditoría)
======================================================= */

export const contractHistory = mysqlTable("contract_history",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  contractId: bigint("contract_id",{mode:"number"}).notNull(),

  changedBy: bigint("changed_by",{mode:"number"}).notNull(),

  oldValue: varchar("old_value",{length:255}),

  newValue: varchar("new_value",{length:255}),

  ...baseColumns
},
(table)=>({
  contractIdx: index("history_contract_idx").on(table.contractId)
}))