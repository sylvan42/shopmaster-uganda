import { useState } from 'react'
import { User, Store, Bell, ChevronDown } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'shop', label: 'Shop', icon: Store },
  { id: 'preferences', label: 'Preferences', icon: Bell },
]

const FormField = ({ label, children }) => (
  <div>
    <label className="block text-body-strong text-ink mb-[8px]">{label}</label>
    {children}
  </div>
)

export const Settings = () => {
  const { user, userRole } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const [profile, setProfile] = useState({
    name: user?.user_metadata?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [shop, setShop] = useState({
    name: user?.user_metadata?.shopName || 'My Shop',
    address: 'Nakawa Market, Kampala',
    phone: '+256 700 123 456',
    businessType: 'retail',
  })

  const [prefs, setPrefs] = useState({
    lowStockAlert: true,
    dailySummary: false,
    theme: 'light',
  })

  return (
    <div className="space-y-[28px]">
      <PageHeader title="Settings" subtitle="Manage your account and shop preferences" />

      {/* Tabs */}
      <div className="flex border-b border-hairline-light gap-[0px]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-[8px] px-[20px] py-[12px] text-body-md transition-colors -mb-[1px] border-b-2 ${
              activeTab === id
                ? 'border-ink text-ink font-medium'
                : 'border-transparent text-shade-60 hover:text-ink'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-[20px]">
          {/* Avatar */}
          <div className="card-standard flex items-center gap-[20px]">
            <div className="w-16 h-16 rounded-full bg-aloe-10 flex items-center justify-center text-heading-md font-medium text-ink select-none">
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : profile.email.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-body-strong text-ink">{profile.name || profile.email}</p>
              <p className="text-caption text-shade-60">{userRole === 'admin' ? 'Shop Owner' : 'Employee'}</p>
            </div>
          </div>

          <div className="card-standard space-y-[20px]">
            <h3 className="text-heading-md font-medium text-ink">Personal Information</h3>
            <FormField label="Full Name">
              <input className="text-input" value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name" />
            </FormField>
            <FormField label="Email">
              <input className="text-input opacity-60 cursor-not-allowed" value={profile.email} readOnly />
              <p className="text-caption text-shade-60 mt-[4px]">Email cannot be changed here.</p>
            </FormField>
            <button className="btn-primary-pill">Save Changes</button>
          </div>

          <div className="card-standard space-y-[20px]">
            <h3 className="text-heading-md font-medium text-ink">Change Password</h3>
            <FormField label="Current Password">
              <input type="password" className="text-input" value={profile.currentPassword}
                onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                placeholder="••••••••" />
            </FormField>
            <FormField label="New Password">
              <input type="password" className="text-input" value={profile.newPassword}
                onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                placeholder="Min. 6 characters" />
            </FormField>
            <FormField label="Confirm New Password">
              <input type="password" className="text-input" value={profile.confirmPassword}
                onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                placeholder="••••••••" />
            </FormField>
            <button className="btn-primary-pill">Update Password</button>
          </div>
        </div>
      )}

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <div className="card-standard space-y-[20px]">
          <h3 className="text-heading-md font-medium text-ink">Shop Details</h3>
          <FormField label="Shop Name">
            <input className="text-input" value={shop.name}
              onChange={(e) => setShop({ ...shop, name: e.target.value })} />
          </FormField>
          <FormField label="Address">
            <input className="text-input" value={shop.address}
              onChange={(e) => setShop({ ...shop, address: e.target.value })} />
          </FormField>
          <FormField label="Phone Number">
            <input className="text-input" value={shop.phone}
              onChange={(e) => setShop({ ...shop, phone: e.target.value })} />
          </FormField>
          <FormField label="Business Type">
            <div className="relative">
              <select className="text-input appearance-none cursor-pointer pr-[40px]"
                value={shop.businessType}
                onChange={(e) => setShop({ ...shop, businessType: e.target.value })}>
                <option value="retail">Retail Shop</option>
                <option value="wholesale">Wholesale</option>
                <option value="both">Retail & Wholesale</option>
              </select>
              <ChevronDown size={16} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-shade-60 pointer-events-none" />
            </div>
          </FormField>
          <FormField label="Currency">
            <input className="text-input opacity-60 cursor-not-allowed" value="UGX — Ugandan Shilling" readOnly />
          </FormField>
          <button className="btn-primary-pill">Save Shop Details</button>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-[20px]">
          <div className="card-standard space-y-[20px]">
            <h3 className="text-heading-md font-medium text-ink">Notifications</h3>
            {[
              { key: 'lowStockAlert', label: 'Low Stock Alerts', desc: 'Get notified when a product falls below its reorder point' },
              { key: 'dailySummary', label: 'Daily Sales Summary', desc: 'Receive a summary of each day\'s performance' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-[4px]">
                <div>
                  <p className="text-body-strong text-ink">{label}</p>
                  <p className="text-caption text-shade-60">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-[16px]">
                  <input type="checkbox" checked={prefs[key]}
                    onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                    className="sr-only peer" />
                  <div className="w-10 h-6 bg-shade-30 peer-checked:bg-ink rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>

          <div className="card-standard space-y-[20px]">
            <h3 className="text-heading-md font-medium text-ink">Appearance</h3>
            <div>
              <p className="text-body-strong text-ink mb-[12px]">Theme</p>
              <div className="flex gap-[8px]">
                {['light', 'system'].map((t) => (
                  <button key={t} onClick={() => setPrefs({ ...prefs, theme: t })}
                    className={`px-[16px] py-[8px] rounded-pill text-caption capitalize transition-colors ${
                      prefs.theme === t ? 'bg-ink text-on-primary' : 'bg-canvas-cream border border-hairline-light text-ink hover:bg-shade-30'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-primary-pill">Save Preferences</button>
          </div>
        </div>
      )}
    </div>
  )
}
