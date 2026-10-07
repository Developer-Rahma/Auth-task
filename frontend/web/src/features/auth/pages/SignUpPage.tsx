import { AuthShell } from '../components/AuthShell'
import { SignupForm } from '../components/SignupForm'

export function SignUpPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  )
}
