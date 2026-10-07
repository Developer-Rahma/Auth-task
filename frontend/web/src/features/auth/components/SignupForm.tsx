import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Check, Circle } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/lib/apiError'
import { PasswordField } from './PasswordField'
import { useSignup } from '../hooks/useSignup'
import { signUpSchema, type SignUpValues } from '../schemas/auth.schema'
import { passwordRules } from '../utils/passwordRules'


export function SignupForm() {
  const navigate = useNavigate()
  const signup = useSignup()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  })
  const password = useWatch({ control, name: 'password', defaultValue: '' })

  const submit = (values: SignUpValues) => {
    signup.mutate(values, {
      onSuccess: () => navigate('/application', { replace: true }),
    })
  }

  return (
    <section aria-labelledby="signup-title" className="auth-card">
      <h1 id="signup-title">Create your account</h1>
      <p className="auth-subtitle">
        Start with a few details. Your next chapter begins here.
      </p>
      <form className="auth-form" noValidate onSubmit={handleSubmit(submit)}>
        <div className="form-field">
          <label className="form-label" htmlFor="signup-name">
            Name
          </label>
          <input
            {...register('name')}
            aria-describedby={errors.name ? 'signup-name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className="form-control"
            id="signup-name"
            placeholder="Your name"
          />
          {errors.name ? (
            <span className="field-error" id="signup-name-error" role="alert">
              {errors.name.message}
            </span>
          ) : null}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="signup-email">
            Email
          </label>
          <input
            {...register('email')}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="form-control"
            id="signup-email"
            placeholder="you@example.com"
            type="email"
          />
          {errors.email ? (
            <span className="field-error" id="signup-email-error" role="alert">
              {errors.email.message}
            </span>
          ) : null}
        </div>
        <PasswordField
          autoComplete="new-password"
          error={errors.password?.message}
          id="signup-password"
          label="Password"
          registration={register('password')}
        />
        <ul aria-label="Password requirements" className="password-rules">
          {passwordRules.map(({ label, test }) => {
            const valid = test(password)
            const Icon = valid ? Check : Circle

            return (
              <li
                className={`password-rule ${valid ? 'password-rule-valid' : ''}`}
                key={label}
              >
                <Icon aria-hidden="true" size={14} />
                {label}
              </li>
            )
          })}
        </ul>
        {signup.isError ? (
          <p className="field-error" role="alert">
            {getApiErrorMessage(signup.error)}
          </p>
        ) : null}
        <button
          className="button button-primary button-full mt-1"
          disabled={signup.isPending}
          type="submit"
        >
          {signup.isPending ? 'Creating account…' : 'Create account'}
          {!signup.isPending ? <ArrowRight aria-hidden="true" size={16} /> : null}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </section>
  )
}
