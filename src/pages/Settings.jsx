import { useState } from 'react'
import { User, Store, Copy, Check, ChevronDown } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { shopService } from '../services/shopService'
import { supabase } from '../services/supabase'

const FormField = ({ label, hint, children }) => (
  <div>
    <label className="block text-body-strong text-ink mb-[8px]">{label}</label>
    {children}
    {hint && <p className="text-caption text-shade-60 mt-[4px]">{hint}</p>}
  </div>
)

export const Settings = () => {
  const { user, profile, userRole, shopId, shopName, inviteCode, refreshProfile } = useAuth()
  const toast = useToast()
  const isOwner = userRole === 'owner'

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    ...(isOwner ? [{ id: 'shop', label: 'Shop', icon: Store }] : []),
  ]
  const [activeTab, setActiveTab] = useState('profile')

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [pwd, setPwd] = useState({ next: '', confirm: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  const [shopNameInput, setShopNameInput] = useState(shopName || '')
  const [savingShop, setSavingShop] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    const { error } = await shopService.updateProfile(user.id, { full_name: fullName.trim(), phone: phone.trim() || null })
    setSavingProfile(false)
    if (error) toast.error(error.message)
    else { toast.success('Profile updated'); refreshProfile() }
  }

  const handleChangePassword = async () => {
    if (pwd.next.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (pwd.next !== pwd.confirm) { toast.error('Passwords do not match'); return }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: pwd.next })
    setSavingPwd(false)
    if (error) toast.error(error.message)
    else { toast.success('Password updated'); setPwd({ next: '', confirm: '' }) }
  }

  const handleSaveShop = async () => {
    if (!shopNameInput.trim()) { toast.error('Shop name cannot be empty'); return }
    setSavingShop(true)
    const { error } = await shopService.updateShopName(shopId, shopNameInput.trim())
    setSavingShop(false)
    if (error) toast.error(error.message)
    else { toast.success('Shop details saved'); refreshProfile() }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-[28px]">
      <PageHeader title="Settings" subtitle="Manage your account and shop" />

      {/* Tabs */}
      <div className="flex border-b border-hairline-light">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-[8px] px-[20px] py-[12px] text-body-md transition-colors -mb-[1px] border-b-2 ${
              activeTab === id ? 'border-ink text-ink font-medium' : 'border-transparent text-shade-60 hover:text-ink'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-[20px]">
          <div className="card-standard flex items-center gap-[20px]">
            <div className="w-16 h-16 rounded-full bg-aloe-10 flex items-center justify-center text-heading-md font-medium text-ink select-none">
              {(profile?.full_name || user?.email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-body-strong text-ink">{profile?.full_name || user?.email}</p>
              <p className="text-caption text-shade-60">{isOwner ? 'Shop Owner' : 'Employee'} · {shopName}</p>
            </div>
          </div>

          <div className="card-standard space-y-[20px]">
            <h3 className="text-heading-md font-medium text-ink">Personal Information</h3>
            <FormField label="Full Name">
              <input className="text-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
            </FormField>
            <FormField label="Phone">
              <input className="text-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" />
            </FormField>
            <FormField label="Email" hint="Email cannot be changed here.">
              <input className="text-input opacity-60 cursor-not-allowed" value={user?.email || ''} readOnly />
            </FormField>
            <button className="btn-primary-pill" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          <div className="card-standard space-y-[20px]">
            <h3 className="text-heading-md font-medium text-ink">Change Password</h3>
            <FormField label="New Password">
              <input type="password" className="text-input" value={pwd.next}
                onChange={(e) => setPwd({ ...pwd, next: e.target.value })} placeholder="Min. 6 characters" />
            </FormField>
            <FormField label="Confirm New Password">
              <input type="password" className="text-input" value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} placeholder="••••••••" />
            </FormField>
            <button className="btn-primary-pill" onClick={handleChangePassword} disabled={savingPwd}>
              {savingPwd ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'shop' && isOwner && (
        <div className="space-y-[20px]">
          <div className="card-standard space-y-[20px]">
            <h3 className="text-heading-md font-medium text-ink">Shop Details</h3>
            <FormField label="Shop Name">
              <input className="text-input" value={shopNameInput} onChange={(e) => setShopNameInput(e.target.value)} />
            </FormField>
            <FormField label="Currency">
              <input className="text-input opacity-60 cursor-not-allowed" value="UGX — Ugandan Shilling" readOnly />
            </FormField>
            <button className="btn-primary-pill" onClick={handleSaveShop} disabled={savingShop}>
              {savingShop ? 'Saving…' : 'Save Shop Details'}
            </button>
          </div>

          <div className="card-standard space-y-[12px]">
            <h3 className="text-heading-md font-medium text-ink">Invite Code</h3>
            <p className="text-caption text-shade-60">Staff use this code to join your shop. Manage it on the Employees page.</p>
            <div className="flex items-center gap-[12px]">
              <span className="text-heading-md font-display tracking-widest text-ink bg-canvas-cream border border-hairline-light rounded-lg px-[16px] py-[10px]">
                {inviteCode || '— — — —'}
              </span>
              <button className="btn-outline-on-light flex items-center gap-[8px]" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
