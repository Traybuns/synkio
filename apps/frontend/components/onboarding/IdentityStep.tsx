'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'

interface IdentityStepProps {
  isNewUser: boolean
  formData: {
    email: string
    username: string
    password: string
    confirmPassword: string
    name: string
  }
  onFormDataChange: (data: Partial<IdentityStepProps['formData']>) => void
  onGoogleSignIn: () => void
}

const emailSchema = z.string().email('Please enter a valid email address').min(1, 'Email is required')

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one capital letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-z0-9._-]+$/, 'Username can only contain lowercase letters, numbers, dots, underscores, and hyphens')

const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

const emailOrUsernameSchema = z.string().min(1, 'Email or username is required').refine(
  (val) => {
    if (val.includes('@')) {
      return emailSchema.safeParse(val).success
    } else {
      return usernameSchema.safeParse(val).success
    }
  },
  (val) => {
    if (val.includes('@')) {
      const result = emailSchema.safeParse(val)
      if (!result.success) {
        return { message: result.error.errors[0].message }
      }
    } else {
      const result = usernameSchema.safeParse(val)
      if (!result.success) {
        return { message: result.error.errors[0].message }
      }
    }
    return { message: 'Invalid email or username' }
  }
)

export default function IdentityStep({ 
  isNewUser, 
  formData, 
  onFormDataChange,
  onGoogleSignIn 
}: IdentityStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string) => {
    let result: z.SafeParseReturnType<any, any>
    
    switch (field) {
      case 'email':
        result = emailSchema.safeParse(value)
        break
      case 'password':
        result = passwordSchema.safeParse(value)
        if (result.success && touched.confirmPassword && formData.confirmPassword) {
          const confirmResult = z.string().refine(
            (val) => val === value,
            { message: 'Passwords do not match' }
          ).safeParse(formData.confirmPassword)
          if (!confirmResult.success) {
            setErrors(prev => ({ ...prev, confirmPassword: confirmResult.error.errors[0].message }))
          } else {
            setErrors(prev => {
              const newErrors = { ...prev }
              delete newErrors.confirmPassword
              return newErrors
            })
          }
        }
        break
      case 'confirmPassword':
        result = z.string()
          .min(1, 'Please confirm your password')
          .refine((val) => val === formData.password, { message: 'Passwords do not match' })
          .safeParse(value)
        break
      case 'username':
        result = usernameSchema.safeParse(value)
        break
      case 'name':
        result = nameSchema.safeParse(value)
        break
      case 'emailOrUsername':
        result = emailOrUsernameSchema.safeParse(value)
        break
      default:
        return
    }

    if (result.success) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    } else {
      setErrors(prev => ({
        ...prev,
        [field]: result.error.errors[0].message
      }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = field === 'emailOrUsername' 
      ? (formData.email || formData.username || '')
      : formData[field as keyof typeof formData]
    validateField(field, value)
  }

  const handleChange = (field: string, value: string) => {
    onFormDataChange({ [field]: value } as any)
    
    if (touched[field]) {
      validateField(field, value)
    }
  }

  return (
    <div>
      {isNewUser && (
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Your Identity
        </h2>
      )}
      {!isNewUser && (
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Welcome back! <br />  Please sign in to continue
        </h2>
      )}

      <div className="space-y-4">
        {!isNewUser ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email or Username *
              </label>
              <input
                type="text"
                value={formData.email || formData.username || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes('@')) {
                    handleChange('email', value)
                    onFormDataChange({ email: value, username: '' });
                  } else {
                    handleChange('username', value)
                    onFormDataChange({ username: value, email: '' });
                  }
                }}
                onBlur={() => handleBlur('emailOrUsername')}
                placeholder="your@email.com or username"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none bg-white text-gray-900 placeholder-gray-400 ${
                  errors.emailOrUsername && touched.emailOrUsername
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-linka-emerald'
                }`}
              />
              {errors.emailOrUsername && touched.emailOrUsername && (
                <p className="text-xs text-red-500 mt-1">{errors.emailOrUsername}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none bg-white text-gray-900 placeholder-gray-400 ${
                    errors.password && touched.password
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-linka-emerald'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="your@email.com"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none bg-white text-gray-900 placeholder-gray-400 ${
                  errors.email && touched.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-linka-emerald'
                }`}
              />
              {errors.email && touched.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="John Doe"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none bg-white text-gray-900 placeholder-gray-400 ${
                  errors.name && touched.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-linka-emerald'
                }`}
              />
              {errors.name && touched.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                placeholder="johndoe"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none bg-white text-gray-900 placeholder-gray-400 ${
                  errors.username && touched.username
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-linka-emerald'
                }`}
              />
              {errors.username && touched.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">This will be your @username.synkio identifier</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none bg-white text-gray-900 placeholder-gray-400 ${
                    errors.password && touched.password
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-linka-emerald'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none bg-white text-gray-900 placeholder-gray-400 ${
                    errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-linka-emerald'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </>
        )}
      </div>

      {isNewUser && (
        <div className="mt-4">
          <button
            onClick={onGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      )}
    </div>
  )
}
