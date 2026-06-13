import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await login(email, password)
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex font-body antialiased">
      {/* Left — cinematic panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-canvas-night flex-col justify-between p-[64px]">
        <div className="flex items-center gap-[10px]">
          <ShoppingBag size={22} className="text-aloe-10" />
          <span className="text-heading-sm font-display font-medium text-on-primary tracking-tight">ShopMaster</span>
        </div>
        <div>
          <span className="pill-tag-mint mb-[24px] inline-flex">Uganda</span>
          <h1 className="text-display-lg font-display text-on-primary leading-tight mb-[24px]">
            Run your shop.<br />Simply.
          </h1>
          <ul className="space-y-[12px]">
            {['Track daily sales in real time', 'Get low-stock alerts instantly', 'Manage your team with ease'].map((f) => (
              <li key={f} className="flex items-center gap-[10px] text-body-md text-shade-40">
                <span className="w-1.5 h-1.5 rounded-full bg-aloe-10 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-caption text-shade-60">© {new Date().getFullYear()} ShopMaster Uganda</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 bg-canvas-light flex items-center justify-center px-[24px] py-[48px]">
        <div className="w-full max-w-md">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-[8px] mb-[32px]">
            <ShoppingBag size={20} className="text-ink" />
            <span className="text-heading-sm font-display font-medium text-ink">ShopMaster</span>
          </div>

          <h2 className="text-heading-xl font-medium text-ink mb-[8px]">Welcome back</h2>
          <p className="text-body-md text-shade-60 mb-[32px]">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-[20px]">
            <div>
              <label className="block text-body-strong text-ink mb-[8px]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-body-strong text-ink mb-[8px]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-input pr-[44px]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-shade-60 hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#fee2e2] text-[#991b1b] px-[12px] py-[10px] rounded-md text-caption">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary-pill w-full mt-[8px]">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-body-md text-shade-60 mt-[24px]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-ink font-medium hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
