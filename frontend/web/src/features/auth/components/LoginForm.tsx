import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/lib/apiError'
import { PasswordField } from './PasswordField'
import { useSignin } from '../hooks/useSignin'
import { signInSchema, type SignInValues } from '../schemas/auth.schema'

export function LoginForm() {
  const navigate = useNavigate()
  const signin = useSignin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = (values: SignInValues) => {
    signin.mutate(values, {
      onSuccess: () => navigate('/application', { replace: true }),
    })
  }

  return (
    <section aria-labelledby="signin-title" className="auth-card">
      <h1 id="signin-title">Welcome back</h1>
      <p className="auth-subtitle">
        Sign in to continue to your secure workspace.
      </p>
      <form className="auth-form" noValidate onSubmit={handleSubmit(submit)}>
        <div className="form-field">
          <label className="form-label" htmlFor="signin-email">
            Email
          </label>
          <input
            {...register('email')}
            aria-describedby={errors.email ? 'signin-email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="form-control"
            id="signin-email"
            placeholder="you@example.com"
            type="email"
          />
          {errors.email ? (
            <span className="field-error" id="signin-email-error" role="alert">
              {errors.email.message}
            </span>
          ) : null}
        </div>
        <PasswordField
          autoComplete="current-password"
          error={errors.password?.message}
          id="signin-password"
          label="Password"
          registration={register('password')}
        />
        {signin.isError ? (
          <p className="field-error" role="alert">
            {getApiErrorMessage(signin.error)}
          </p>
        ) : null}
        <button
          className="button button-primary button-full mt-1"
          disabled={signin.isPending}
          type="submit"
        >
          {signin.isPending ? 'Signing in…' : 'Sign in'}
          {!signin.isPending ? <ArrowRight aria-hidden="true" size={16} /> : null}
        </button>
      </form>
      <p className="auth-switch">
        New to Aster? <Link to="/signup">Create an account</Link>
      </p>
    </section>
  )
}
