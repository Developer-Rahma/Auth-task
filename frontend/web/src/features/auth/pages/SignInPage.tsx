import { AuthShell } from '../components/AuthShell'
import { LoginForm } from '../components/LoginForm'

export function SignInPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  )
}
