import { z } from "zod";

export const createSessionSchema = z.object({
  scheduledFor: z
    .string({
      error: "scheduledFor is required",
    })
    .min(1, "scheduledFor is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), {
      message: "Session must be scheduled in the future",
    }),
  capacity: z
    .number({
      error: "Capacity must be a positive integer",
    })
    .int("Capacity must be a positive integer")
    .positive("Capacity must be a positive integer")
    .optional()
    .default(20),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
