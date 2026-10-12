import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string({
      error: "Name is required",
    })
    .trim()
    .min(1, "Name is required"),
  email: z
    .string({
      error: "Email is required",
    })
    .trim()
    .email("Invalid email address"),
  password: z
    .string({
      error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters"),
});

export const createUserSchema = signupSchema;

export const loginSchema = z.object({
  email: z
    .string({
      error: "Email is required",
    })
    .trim()
    .email("Invalid email address"),
  password: z
    .string({
      error: "Password is required",
    })
    .min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
