import {
  mysqlTable,
  bigint,
  varchar,
  int,
  decimal,
  date,
  timestamp
} from "drizzle-orm/mysql-core"

/* ---------- COMPANIES ---------- */
export const companies = mysqlTable("companies", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  name: varchar("name",{length:255}).notNull(),
  createdAt: timestamp("created_at").defaultNow()
})

/* ---------- USERS ---------- */
export const users = mysqlTable("users",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  companyId: bigint("company_id",{mode:"number"}),
  role: varchar("role",{length:50}).notNull(),
  email: varchar("email",{length:255}).notNull(),
  passwordHash: varchar("password_hash",{length:255})
})

/* ---------- CLIENTS ---------- */
export const clients = mysqlTable("clients",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  companyId: bigint("company_id",{mode:"number"}),
  userId: bigint("user_id",{mode:"number"})
})

/* ---------- SERVICES ---------- */
export const services = mysqlTable("services",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  companyId: bigint("company_id",{mode:"number"}),
  stockTotal: int("stock_total"),
  priceBase: decimal("price_base",{precision:10,scale:2})
})

/* ---------- CONTRACTS ---------- */
export const contracts = mysqlTable("contracts",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  companyId: bigint("company_id",{mode:"number"}),
  clientId: bigint("client_id",{mode:"number"}),
  eventDate: date("event_date"),
  status: varchar("status",{length:50}),
  totalAmount: decimal("total_amount",{precision:12,scale:2})
})

/* ---------- CONTRACT ITEMS ---------- */
export const contractItems = mysqlTable("contract_items",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  contractId: bigint("contract_id",{mode:"number"}),
  serviceId: bigint("service_id",{mode:"number"}),
  quantity: int("quantity")
})

/* ---------- PAYMENTS ---------- */
export const payments = mysqlTable("payments",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  contractId: bigint("contract_id",{mode:"number"}),
  amount: decimal("amount",{precision:12,scale:2})
})

/* ---------- REFUNDS ---------- */
export const refunds = mysqlTable("refunds",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  paymentId: bigint("payment_id",{mode:"number"})
})

/* ---------- CONTRACT HISTORY ---------- */
export const contractHistory = mysqlTable("contract_history",{
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  contractId: bigint("contract_id",{mode:"number"}),
  changedBy: bigint("changed_by",{mode:"number"}),
  oldValue: varchar("old_value",{length:255}),
  newValue: varchar("new_value",{length:255})
})