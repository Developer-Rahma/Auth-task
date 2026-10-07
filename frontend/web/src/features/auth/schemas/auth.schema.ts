import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters.'),
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters.')
    .regex(/[A-Za-z]/, 'Include at least one letter.')
    .regex(/\d/, 'Include at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Include at least one special character.'),
})

export const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.'),
  email: z.email('Enter a valid email address.'),
  message: z.string().trim().min(10, 'Write at least 10 characters.'),
})

export type SignUpValues = z.infer<typeof signUpSchema>
export type SignInValues = z.infer<typeof signInSchema>
export type ContactValues = z.infer<typeof contactSchema>
