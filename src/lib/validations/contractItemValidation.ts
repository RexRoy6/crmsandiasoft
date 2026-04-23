import { z } from "zod"

/* ---------- CREATE CONTRACT ITEM ---------- */

export const createContractItemSchema = z.object({
  serviceId: z.number().int(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  serviceNotes: z.string().optional(),

  operationStart: z.string().datetime().optional(),
  operationEnd: z.string().datetime().optional(),
})
  .refine(
    (data) => {
      if (data.operationStart && data.operationEnd) {
        return new Date(data.operationStart) < new Date(data.operationEnd)
      }
      return true
    },
    {
      message: "operationEnd must be after operationStart",
      path: ["operationEnd"]
    }
  )
/* ---------- UPDATE CONTRACT ITEM ---------- */


export const updateContractItemSchema = z.object({
  serviceId: z.number().optional(),
  quantity: z.number().int().positive().optional(),
  serviceNotes: z.string().optional(),
  operationStart: z.string().datetime().optional(),
  operationEnd: z.string().datetime().optional(),
})

/* ---------- TYPES ---------- */

export type CreateContractItemInput =
  z.infer<typeof createContractItemSchema>

export type UpdateContractItemInput =
  z.infer<typeof updateContractItemSchema>