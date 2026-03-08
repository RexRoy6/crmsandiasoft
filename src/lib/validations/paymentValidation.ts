import { z } from "zod"

export const createPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["MXN", "USD"]),
  paymentMethod: z.string().optional()
})

export type CreatePaymentInput =
  z.infer<typeof createPaymentSchema>