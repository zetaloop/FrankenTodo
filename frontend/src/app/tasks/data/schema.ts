import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  labels: z.array(z.string()),
  priority: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export type Task = z.infer<typeof taskSchema>
