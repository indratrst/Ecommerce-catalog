import { z } from "zod";

// Base schema (shared fields)
const UserBaseSchema = {
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().optional().nullable(),
  role: z.enum(["SUPERUSER", "ADMIN", "USER"]),
  orders: z.array(z.string()).optional(), // Array of order IDs
};

// CREATE schema
export const CreateUserSchema = z.object({
  ...UserBaseSchema,
});

// UPDATE schema
export const UpdateUserSchema = z
  .object({
    id: z.union([z.string()]),
    ...UserBaseSchema,
  })
  .partial();

export const UsersResponseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().optional().nullable(),
  role: z.enum(["SUPERUSER", "ADMIN", "USER"]),
  orders: z.array(z.string()).optional(), // Array of order IDs
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UsersResponseSchema>;
