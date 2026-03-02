import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),

  stockTotal: z.number().int().nonnegative(),

  // because DB decimal expects string
  priceBase: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price")
})