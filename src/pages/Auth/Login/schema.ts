import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
});

export type LoginInput = z.infer<typeof loginSchema>;
