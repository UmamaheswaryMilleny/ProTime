import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(25,"last name name not must be more than  100 characters")
      .regex(/^[A-Za-z]+$/, "First name must contain only letters")
      .transform((val) => val.trim()),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(100,"last name name not must be more than  100 characters")
      .regex(/^[A-Za-z]+$/, "Last name must contain only letters")
      .transform((val) => val.trim()),

    email: z.string().email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z.string(),

  

    role: z.enum(["client"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // .refine() is used when validation needs more than one field
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  // z.infer<typeof schema>  “Create a TypeScript type from my validation schema”
export type RegisterFormData = z.infer<typeof registerSchema>;