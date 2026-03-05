import { z } from "zod"

export const createClientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email()
})

export const updateClientSchema =
  createClientSchema.partial()

export type CreateClientInput =
  z.infer<typeof createClientSchema>

export type UpdateClientInput =
  z.infer<typeof updateClientSchema>