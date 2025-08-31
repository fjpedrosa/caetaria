import * as React from 'react'

import { cn } from '@/lib/utils'

import { Input, type InputProps } from '../atoms/input'

export interface FormFieldProps extends Omit<InputProps, 'id' | 'error'> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  id?: string
  name?: string
  renderInput?: (props: InputProps & { id: string }) => React.ReactNode
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    label,
    description,
    error,
    required = false,
    className,
    id,
    name,
    renderInput,
    ...inputProps
  }, ref) => {
    // Generate unique ID if not provided
    const fieldId = id || React.useId()
    const descriptionId = description ? `${fieldId}-description` : undefined
    const errorId = error ? `${fieldId}-error` : undefined

    const inputElement = renderInput ? (
      renderInput({
        ...inputProps,
        id: fieldId,
        error: !!error,
        'aria-describedby': cn(descriptionId, errorId).trim() || undefined,
        'aria-invalid': !!error
      })
    ) : (
      <Input
        {...inputProps}
        ref={ref}
        id={fieldId}
        name={name || fieldId}
        error={!!error}
        aria-describedby={cn(descriptionId, errorId).trim() || undefined}
        aria-invalid={!!error}
      />
    )

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label
            htmlFor={fieldId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {inputElement}

        {description && !error && (
          <p
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

export { FormField }