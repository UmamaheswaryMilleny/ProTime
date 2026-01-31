import { z } from "zod";

export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(/^[A-Za-z]+( [A-Za-z]+)*$/, "First name can only contain alphabets (spaces allowed between words)"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(/^[A-Za-z]+( [A-Za-z]+)*$/, "Last name can only contain alphabets (spaces allowed between words)"),


  bio: z
    .string()
    .min(1, "Bio is required")
    .trim()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must not exceed 500 characters"),

  profileImage: z.string().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;