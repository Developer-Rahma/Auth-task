import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

type PasswordFieldProps = {
  error?: string
  id: string
  label: string
  registration: UseFormRegisterReturn
  autoComplete: string
}

export function PasswordField({
  error,
  id,
  label,
  registration,
  autoComplete,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const errorId = `${id}-error`

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className="password-wrap">
        <input
          {...registration}
          autoComplete={autoComplete}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="form-control"
          id={id}
          type={visible ? 'text' : 'password'}
        />
        <button
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="password-toggle"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
        </button>
      </div>
      {error ? (
        <span className="field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
