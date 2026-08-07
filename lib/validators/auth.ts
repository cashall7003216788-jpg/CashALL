import { z } from "zod";

export const loginSchema = z.object({
  idToken: z.string({
    required_error: "Firebase idToken is required",
  }),
  name: z.string().optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
