import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ShoppingBag, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('employee')
  const [shopName, setShopName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { data, error } = await signup(email, password, {
      role,
      shopName,
      displayName: shopName || email.split('@')[0],
    })

    if (error) {
      setError(error.message)
    } else if (data && !data.session) {
      setError('Signup successful! Please check your email to confirm your account before logging in.')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex font-body antialiased">
      {/* Left — cinematic panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-canvas-night flex-col justify-between p-[64px]">
        <div className="flex items-center gap-[10px]">
          <ShoppingBag size={22} className="text-aloe-10" />
          <span className="text-heading-sm font-display font-medium text-on-primary tracking-tight">ShopMaster</span>
        </div>
        <div>
          <span className="pill-tag-mint mb-[24px] inline-flex">Uganda</span>
          <h1 className="text-display-lg font-display text-on-primary leading-tight mb-[24px]">
            Start managing<br />your shop today.
          </h1>
          <ul className="space-y-[12px]">
            {['Role-based access for your team', 'Inventory and sales in one place', 'Mobile Money payment tracking'].map((f) => (
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
          <div className="lg:hidden flex items-center gap-[8px] mb-[32px]">
            <ShoppingBag size={20} className="text-ink" />
            <span className="text-heading-sm font-display font-medium text-ink">ShopMaster</span>
          </div>

          <h2 className="text-heading-xl font-medium text-ink mb-[8px]">Create an account</h2>
          <p className="text-body-md text-shade-60 mb-[32px]">Set up your shop management system.</p>

          <form onSubmit={handleSubmit} className="space-y-[18px]">
            <div>
              <label className="block text-body-strong text-ink mb-[8px]">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="text-input" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="block text-body-strong text-ink mb-[8px]">Shop Name</label>
              <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)}
                className="text-input" placeholder="e.g. Nakawa General Store" required />
            </div>

            <div>
              <label className="block text-body-strong text-ink mb-[8px]">Role</label>
              <div className="relative">
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="text-input appearance-none cursor-pointer pr-[40px] bg-canvas-light">
                  <option value="admin">Shop Owner</option>
                  <option value="employee">Employee</option>
                </select>
                <ChevronDown size={16} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-shade-60 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-body-strong text-ink mb-[8px]">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-input pr-[44px]" placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-shade-60 hover:text-ink transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-body-strong text-ink mb-[8px]">Confirm Password</label>
              <input type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-input" placeholder="••••••••" required />
            </div>

            {error && (
              <div className={`px-[12px] py-[10px] rounded-md text-caption ${
                error.includes('successful')
                  ? 'bg-aloe-10 text-ink'
                  : 'bg-[#fee2e2] text-[#991b1b]'
              }`}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary-pill w-full mt-[8px]">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-body-md text-shade-60 mt-[24px]">
            Already have an account?{' '}
            <Link to="/login" className="text-ink font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
