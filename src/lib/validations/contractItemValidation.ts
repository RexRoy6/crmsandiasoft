import { z } from "zod"

/* ---------- CREATE CONTRACT ITEM ---------- */

export const createContractItemSchema = z.object({

  serviceId: z
    .number()
    .int()
    .positive(),

  quantity: z
    .number()
    .int()
    .positive()

})

/* ---------- UPDATE CONTRACT ITEM ---------- */

export const updateContractItemSchema = z.object({

  quantity: z
    .number()
    .int()
    .positive()

})

/* ---------- TYPES ---------- */

export type CreateContractItemInput =
  z.infer<typeof createContractItemSchema>

export type UpdateContractItemInput =
  z.infer<typeof updateContractItemSchema>