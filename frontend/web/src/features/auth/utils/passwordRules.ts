export const passwordRules = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'At least one letter', test: (value: string) => /[A-Za-z]/.test(value) },
  { label: 'At least one number', test: (value: string) => /\d/.test(value) },
  {
    label: 'At least one special character',
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
]
