import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address'),
  name: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
