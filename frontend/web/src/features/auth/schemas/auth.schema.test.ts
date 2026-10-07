import { describe, expect, it } from 'vitest'
import { signInSchema, signUpSchema } from './auth.schema'

describe('auth schemas', () => {
  it('requires a 3-character name and a backend-compliant signup password', () => {
    const valid = {
      name: 'Avery Morgan',
      email: 'avery@example.com',
      password: 'SecurePass1!',
    }

    expect(signUpSchema.safeParse(valid).success).toBe(true)
    expect(signUpSchema.safeParse({ ...valid, name: 'Al' }).success).toBe(false)
    expect(signUpSchema.safeParse({ ...valid, password: 'Password123' }).success).toBe(false)
  })

  it('requires a valid email and a non-empty signin password', () => {
    expect(
      signInSchema.safeParse({
        email: 'avery@example.com',
        password: 'anything',
      }).success,
    ).toBe(true)
    expect(
      signInSchema.safeParse({ email: 'invalid', password: '' }).success,
    ).toBe(false)
  })
})
