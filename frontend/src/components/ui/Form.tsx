'use client'

import {
  FieldValues,
  FormProvider,
  UseFormProps,
  UseFormReturn,
  useForm,
  Controller,
} from 'react-hook-form'
import { ReactNode } from 'react'

interface FormProps<T extends FieldValues> extends UseFormProps<T> {
  children: ReactNode
  onSubmit: (data: T) => void | Promise<void>
  isLoading?: boolean
}

export function Form<T extends FieldValues>({
  children,
  onSubmit,
  isLoading,
  ...props
}: FormProps<T>) {
  const methods = useForm<T>(props)

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {children}
      </form>
    </FormProvider>
  )
}

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
  rows?: number
  options?: Array<{ value: string; label: string }>
  disabled?: boolean
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  error,
  rows,
  options,
  disabled,
}: FormFieldProps) {
  const { register, formState: { errors } } = useForm()

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          {...register(name)}
          placeholder={placeholder}
          rows={rows || 3}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary disabled:bg-gray-100"
        />
      ) : type === 'select' ? (
        <select
          {...register(name)}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary disabled:bg-gray-100"
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary disabled:bg-gray-100"
        />
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
