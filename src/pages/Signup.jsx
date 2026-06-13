import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ShoppingBag, Store, Users, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/supabase'

export const Signup = () => {
  const [mode, setMode] = useState('owner') // 'owner' | 'employee'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [shopName, setShopName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [inviteShopName, setInviteShopName] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  // Live-validate the invite code so the employee sees which shop they're joining
  useEffect(() => {
    const code = inviteCode.trim()
    if (mode !== 'employee' || code.length < 9) {
      setInviteShopName(null)
      return
    }
    let cancelled = false
    const t = setTimeout(async () => {
      const { data } = await authService.validateInviteCode(code)
      if (!cancelled) setInviteShopName(data || null)
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [inviteCode, mode])

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
    if (mode === 'owner' && !shopName.trim()) {
      setError('Please enter your shop name')
      return
    }
    if (mode === 'employee' && !inviteCode.trim()) {
      setError('Please enter the invite code from your shop owner')
      return
    }

    setLoading(true)
    const userData =
      mode === 'owner'
        ? { role: 'owner', full_name: fullName.trim(), shop_name: shopName.trim() }
        : { role: 'employee', full_name: fullName.trim(), invite_code: inviteCode.trim().toUpperCase() }

    const { data, error } = await signup(email, password, userData)

    if (error) {
      if (error.message?.toLowerCase().includes('invalid invite code')) {
        setError('That invite code is not valid. Ask your shop owner for the current code.')
      } else {
        setError(error.message)
      }
    } else if (data && !data.session) {
      setError('Signup successful! Please check your email to confirm your account before logging in.')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const tabClass = (active) =>
    `flex-1 flex items-center justify-center gap-[8px] px-[16px] py-[10px] rounded-lg text-body-md font-medium transition-colors ${
      active ? 'bg-ink text-on-primary' : 'bg-canvas-cream text-shade-60 hover:text-ink'
    }`

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
            {['Owners create a shop and share an invite code', 'Employees join with the code and record sales', 'Inventory, sales and profit in one place'].map((f) => (
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
          <p className="text-body-md text-shade-60 mb-[24px]">Set up a new shop or join an existing one.</p>

          {/* Mode tabs */}
          <div className="flex gap-[8px] p-[4px] bg-canvas-cream border border-hairline-light rounded-xl mb-[24px]">
            <button type="button" className={tabClass(mode === 'owner')} onClick={() => setMode('owner')}>
              <Store size={16} /> Create a shop
            </button>
            <button type="button" className={tabClass(mode === 'employee')} onClick={() => setMode('employee')}>
              <Users size={16} /> Join a shop
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-[18px]">
            <div>
              <label className="block text-body-strong text-ink mb-[8px]">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="text-input" placeholder="e.g. Nakato Sarah" required />
            </div>

            <div>
              <label className="block text-body-strong text-ink mb-[8px]">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="text-input" placeholder="you@example.com" required />
            </div>

            {mode === 'owner' ? (
              <div>
                <label className="block text-body-strong text-ink mb-[8px]">Shop Name</label>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)}
                  className="text-input" placeholder="e.g. Nakawa General Store" required />
              </div>
            ) : (
              <div>
                <label className="block text-body-strong text-ink mb-[8px]">Invite Code</label>
                <input type="text" value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="text-input uppercase tracking-widest" placeholder="SHOP-XXXX" required />
                {inviteShopName && (
                  <p className="flex items-center gap-[6px] text-caption text-ink mt-[8px]">
                    <CheckCircle2 size={14} className="text-[#15803d]" />
                    You're joining <span className="font-medium">{inviteShopName}</span>
                  </p>
                )}
                {!inviteShopName && inviteCode.trim().length >= 9 && (
                  <p className="text-caption text-[#991b1b] mt-[8px]">No shop found for this code.</p>
                )}
              </div>
            )}

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
              {loading ? 'Creating account…' : mode === 'owner' ? 'Create shop & account' : 'Join shop'}
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
