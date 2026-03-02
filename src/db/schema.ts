import {
  mysqlTable,
  bigint,
  varchar,
  int,
  decimal,
  date,
  timestamp,
  index,
   mysqlEnum
} from "drizzle-orm/mysql-core"

/* ---------- BASE COLUMNS (audit + soft delete) ---------- */

const baseColumns = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  deletedAt: timestamp("deleted_at")
}


// contracts.status
export const CONTRACT_STATUS = [
  "draft",
  "active",
  "cancelled",
  "completed"
] as const

export type ContractStatus = typeof CONTRACT_STATUS[number]
export const contractStatusEnum = mysqlEnum("status", CONTRACT_STATUS)

/* ---------- USER ROLES (single source of truth) ---------- */

export const USER_ROLES = ["admin", "owner", "user"] as const

export type UserRole = typeof USER_ROLES[number]

/* ---------- USER ROLES ENUM DB ---------- */

export const userRoleEnum = mysqlEnum("user_role", USER_ROLES)


/* ---------- COMPANIES ---------- */

export const companies = mysqlTable("companies", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  name: varchar("name",{length:255}).notNull(),
  ...baseColumns
})


/* ---------- USERS ---------- */

export const users = mysqlTable("users", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  companyId: bigint("company_id",{mode:"number"})
    .references(()=>companies.id,{ onDelete:"cascade" }),

  // ✅ usar USER_ROLES directamente
  role: mysqlEnum("role", USER_ROLES).notNull(),

  email: varchar("email",{length:255}).notNull().unique(),

  passwordHash: varchar("password_hash",{length:255}).notNull(),

  ...baseColumns
}, (table)=>({
  companyIdx: index("users_company_idx").on(table.companyId),
  emailIdx: index("users_email_idx").on(table.email)
}))

/* ---------- CLIENTS ---------- */

export const clients = mysqlTable("clients", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  companyId: bigint("company_id",{mode:"number"})
    .notNull()
    .references(()=>companies.id,{ onDelete:"cascade" }),

  userId: bigint("user_id",{mode:"number"})
    .references(()=>users.id),

  name: varchar("name",{length:255}).notNull(),
phone: varchar("phone",{length:50}).notNull(),
email: varchar("email",{length:255}).notNull().unique(),

  ...baseColumns
}, (table)=>({
  companyIdx: index("clients_company_idx").on(table.companyId),
  userIdx: index("clients_user_idx").on(table.userId)
}))

/* ---------- SERVICES ---------- */

export const services = mysqlTable("services", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  companyId: bigint("company_id",{mode:"number"})
    .notNull()
    .references(()=>companies.id,{ onDelete:"cascade" }),

  name: varchar("name",{length:255}).notNull(),
  description: varchar("description",{length:500}),

  stockTotal: int("stock_total").notNull(),
  priceBase: decimal("price_base",{precision:10,scale:2}).notNull(),

  ...baseColumns
}, (table)=>({
  companyIdx: index("services_company_idx").on(table.companyId),
  nameIdx: index("services_name_idx").on(table.name)
}))

/* ---------- CONTRACTS ---------- */

export const contracts = mysqlTable("contracts", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),
  eventName: varchar("event_name",{length:255}).notNull(),

  companyId: bigint("company_id",{mode:"number"})
    .notNull()
    .references(()=>companies.id,{ onDelete:"cascade" }),

  clientId: bigint("client_id",{mode:"number"})
    .notNull()
    .references(()=>clients.id),

  eventDate: date("event_date").notNull(),
    status: contractStatusEnum.notNull(),

  totalAmount: decimal("total_amount",{precision:12,scale:2}).notNull(),

  ...baseColumns
}, (table)=>({
  companyIdx: index("contracts_company_idx").on(table.companyId),
  clientIdx: index("contracts_client_idx").on(table.clientId),
  companyEventDateIdx: index("contracts_company_event_date_idx")
    .on(table.companyId, table.eventDate),
  statusIdx: index("contracts_status_idx").on(table.status)
}))

/* ---------- CONTRACT ITEMS ---------- */

export const contractItems = mysqlTable("contract_items", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  contractId: bigint("contract_id",{mode:"number"})
    .notNull()
    .references(()=>contracts.id,{ onDelete:"cascade" }),

  serviceId: bigint("service_id",{mode:"number"})
    .notNull()
    .references(()=>services.id),

  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price",{precision:10,scale:2}).notNull(),

  ...baseColumns
})

/* ---------- PAYMENTS ---------- */

export const payments = mysqlTable("payments", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  contractId: bigint("contract_id",{mode:"number"})
    .notNull()
    .references(()=>contracts.id,{ onDelete:"cascade" }),

  amount: decimal("amount",{precision:12,scale:2}).notNull(),
  currency: mysqlEnum("currency", ["MXN","USD"]).notNull(),
  paymentMethod: varchar("payment_method",{length:50}),

  ...baseColumns
})

/* ---------- REFUNDS ---------- */

export const refunds = mysqlTable("refunds", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  paymentId: bigint("payment_id",{mode:"number"})
    .notNull()
    .references(()=>payments.id,{ onDelete:"cascade" }),

  ...baseColumns
})

/* ---------- CONTRACT HISTORY ---------- */

export const contractHistory = mysqlTable("contract_history", {
  id: bigint("id",{mode:"number"}).primaryKey().autoincrement(),

  contractId: bigint("contract_id",{mode:"number"})
    .notNull()
    .references(()=>contracts.id,{ onDelete:"cascade" }),

  changedBy: bigint("changed_by",{mode:"number"})
    .references(()=>users.id),

  oldValue: varchar("old_value",{length:255}),
  newValue: varchar("new_value",{length:255}),

  ...baseColumns
})