'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Header from '../../components/ui/Header'
import { useAuth } from '../../contexts/AuthContext'
import { signIn as signInService, createIdentity } from '../../libs/services/identity.service'
import { AuthService } from '../../libs/auth'

export default function LoginPage() {
  const router = useRouter()
  const { setUser, isAuthenticated, user } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    consentGiven: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      if (isSignUp && field !== 'consentGiven') {
        const allFieldsFilled = updated.firstName && updated.lastName && updated.username && updated.email && updated.password && updated.confirmPassword
        if (!allFieldsFilled && updated.consentGiven) {
          updated.consentGiven = false
        }
      }
      return updated
    })
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Please enter your email and password')
      return
    }

    setIsLoading(true)

    try {
      const response = await signInService({
        email: formData.email,
        password: formData.password,
      })

      if (!response.success) {
        const errorMessage = response.error || 'Invalid email or password'
        toast.error(errorMessage)
        return
      }

        toast.success('Signed in successfully!')

      const user = AuthService.formatUserFromResponse(response.data)
      setUser(user)

        router.push('/chat')
    } catch (error) {
      console.error('Error during sign-in:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Unable to connect to server. Please check your connection and try again.')
      } else {
        toast.error('Failed to sign in. Please check your credentials and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Please enter your email and password')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!formData.firstName || !formData.lastName) {
      toast.error('Please enter your first and last name')
      return
    }

    if (!formData.username) {
      toast.error('Please enter a username')
      return
    }

    if (!formData.consentGiven) {
      toast.error('Please accept the terms and conditions to continue')
      return
    }

    setIsLoading(true)

    try {
      const normalizedUsername = formData.username.toLowerCase().trim().endsWith('.synkio')
        ? formData.username.toLowerCase().trim()
        : `${formData.username.toLowerCase().trim()}.synkio`

      const response = await createIdentity({
        email: formData.email,
        username: normalizedUsername,
        password: formData.password,
        profile: {
          name: `${formData.firstName} ${formData.lastName}`,
        },
        consentGiven: formData.consentGiven,
      })

      if (!response.success) {
        const errorMessage = response.error || 'Failed to create account. Please try again.'
        toast.error(errorMessage)
        return
      }

        toast.success('Account created successfully!')

      const user = AuthService.formatUserFromResponse(response.data)
      setUser(user)

        router.push('/chat')
    } catch (error) {
      console.error('Error during sign-up:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Unable to connect to server. Please check your connection and try again.')
      } else {
        const errorMessage = (error as any)?.error || 'Failed to create account. Please try again.'
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    toast.info('Google sign-in is not yet available. Please use email and password.')
  }

  const handleGoogleSignUp = async () => {
    toast.info('Google sign-up is not yet available. Please use email and password.')
  }

  return (
    <div className="min-h-screen bg-[#101322] flex flex-col overscroll-none relative overflow-hidden">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />
      
      <Header variant="landing" onAction={(action) => {
        if (action === 'go-to-chat') {
          router.push('/chat')
        }
      }} />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="w-full max-w-md flex flex-col gap-8 lg:pr-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-[-0.04em] text-white">
                  {isSignUp ? 'Create Account.' : 'Welcome Back.'}
                </h1>
                <p className="text-base md:text-lg text-[#929bc9]">
                  {isSignUp 
                    ? 'Join Synkio and start transacting securely. It\'s free and takes seconds.'
                    : 'Sign in to continue your journey with Synkio. Secure, simple, and seamless.'}
                </p>
              </div>

              {isAuthenticated && user ? (
                <div className="flex flex-col gap-6 items-center lg:items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-linka-emerald rounded-full text-white text-lg font-bold">
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white font-semibold">You're signed in!</p>
                      <p className="text-[#929bc9] text-sm">Continue to your dashboard</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/chat')}
                    className="w-full h-12 px-5 flex items-center justify-center gap-2 bg-linka-emerald hover:bg-emerald-500 text-white text-base font-bold rounded-full transition-all duration-300 shadow-lg shadow-linka-emerald/25"
                  >
                    <span>Go to Chat</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <>
                  <motion.button
                    type="button"
                    onClick={isSignUp ? handleGoogleSignUp : handleGoogleSignIn}
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full h-12 px-5 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-base font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </motion.button>

                  <div className="flex items-center gap-4">
                    <hr className="flex-grow border-white/10" />
                    <span className="text-sm text-[#929bc9]">OR</span>
                    <hr className="flex-grow border-white/10" />
                  </div>

                  <form
                    onSubmit={isSignUp ? handleSignUp : handleSignIn}
                    className="flex flex-col gap-4"
                  >
                  {isSignUp && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="First Name"
                          required
                          className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:border-linka-emerald focus:ring-0 rounded-full text-sm md:text-base transition-colors placeholder:text-[#929bc9] text-white"
                        />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Last Name"
                          required
                          className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:border-linka-emerald focus:ring-0 rounded-full text-sm md:text-base transition-colors placeholder:text-[#929bc9] text-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Username (e.g., johndoe)"
                        required
                        className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:border-linka-emerald focus:ring-0 rounded-full text-sm md:text-base transition-colors placeholder:text-[#929bc9] text-white"
                      />
                    </>
                  )}

                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:border-linka-emerald focus:ring-0 rounded-full text-sm md:text-base transition-colors placeholder:text-[#929bc9] text-white"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full h-12 px-4 pr-10 bg-white/5 border border-white/10 focus:border-linka-emerald focus:ring-0 rounded-full text-sm md:text-base transition-colors placeholder:text-[#929bc9] text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929bc9] hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {isSignUp && (
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm Password"
                        required
                        className="w-full h-12 px-4 pr-10 bg-white/5 border border-white/10 focus:border-linka-emerald focus:ring-0 rounded-full text-sm md:text-base transition-colors placeholder:text-[#929bc9] text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929bc9] hover:text-white transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}

                  {isSignUp && (
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={formData.consentGiven}
                        onChange={(e) => handleInputChange('consentGiven', e.target.checked)}
                        disabled={!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-linka-emerald focus:ring-linka-emerald focus:ring-2 disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                      <label htmlFor="consent" className={`text-sm ${!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword ? 'text-[#929bc9]/50 cursor-not-allowed' : 'text-[#929bc9] cursor-pointer'}`}>
                        I agree to the{' '}
                        <a href="/terms" target="_blank" className="text-linka-emerald hover:underline">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" target="_blank" className="text-linka-emerald hover:underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading || (isSignUp && !formData.consentGiven)}
                    whileHover={{ scale: isLoading || (isSignUp && !formData.consentGiven) ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading || (isSignUp && !formData.consentGiven) ? 1 : 0.98 }}
                    className="w-full h-12 px-5 flex items-center justify-center gap-2 bg-linka-emerald hover:bg-emerald-500 text-white text-base font-bold rounded-full transition-all duration-300 shadow-lg shadow-linka-emerald/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
                </>
              )}

              <div className="flex flex-col gap-4 items-center lg:items-start pt-4">
                <p className="text-sm text-[#929bc9]">
                  {isSignUp ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="font-semibold text-linka-emerald hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      New to Synkio?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className="font-semibold text-linka-emerald hover:underline"
                      >
                        Create an account
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full h-full min-h-[420px] lg:min-h-[520px] flex items-center justify-center relative hidden lg:flex"
          >
            <div className="relative w-full aspect-square max-w-lg">
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-linka-emerald/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-linka-emerald/10 rounded-full blur-2xl" />

              <div className="absolute top-[10%] left-[5%] -rotate-12 transition-transform hover:scale-110 hover:-rotate-6">
                <div className="p-6 bg-white/5 backdrop-blur-lg rounded-xl shadow-lg border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-linka-emerald rounded-full text-white text-lg font-bold">
                      C
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Chat</h3>
                      <p className="text-sm text-[#929bc9]">Connect instantly</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[15%] left-[20%] rotate-6 transition-transform hover:scale-110 hover:rotate-2">
                <div className="p-6 bg-white/5 backdrop-blur-lg rounded-xl shadow-lg border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-linka-emerald rounded-full text-white text-lg font-bold">
                      P
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Pay</h3>
                      <p className="text-sm text-[#929bc9]">Seamlessly &amp; securely</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-[20%] right-0 rotate-12 transition-transform hover:scale-110 hover:rotate-6">
                <div className="p-6 bg-white/5 backdrop-blur-lg rounded-xl shadow-lg border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-linka-emerald rounded-full text-white text-lg font-bold">
                      ▶
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Play</h3>
                      <p className="text-sm text-[#929bc9]">Discover &amp; have fun</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 flex items-center justify-center bg-linka-emerald/10 rounded-full backdrop-blur-sm">
                  <div className="w-32 h-32 flex items-center justify-center bg-linka-emerald rounded-full shadow-2xl shadow-linka-emerald/40">
                    <div className="w-16 h-16 text-white">
                      <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_6_535_center)">
                          <path
                            clipRule="evenodd"
                            d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                            fill="currentColor"
                            fillRule="evenodd"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_6_535_center">
                            <rect fill="white" height="48" width="48" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
