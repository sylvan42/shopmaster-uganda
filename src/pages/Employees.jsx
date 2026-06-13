import { useMemo, useState } from 'react'
import { startOfMonth } from 'date-fns'
import { Users, Search, Copy, Check, RefreshCw, UserX, UserCheck } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { shopService } from '../services/shopService'
import { reportsService } from '../services/reportsService'
import { formatUGX, formatDate } from '../lib/formatters'

const getInitials = (name) => (name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

export const Employees = () => {
  const { inviteCode, refreshProfile, user } = useAuth()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [toggling, setToggling] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data: employees, loading, error, refetch } = useSupabaseQuery(
    () => shopService.listEmployees(),
    []
  )

  // This month's per-employee sales come from the owner report's by_employee block
  const monthRange = useMemo(() => {
    const from = startOfMonth(new Date())
    const to = new Date()
    to.setDate(to.getDate() + 1)
    return { from, to }
  }, [])
  const { data: report } = useSupabaseQuery(
    () => reportsService.getOwnerReport(monthRange),
    []
  )
  const statsByEmployee = useMemo(() => {
    const map = {}
    ;(report?.by_employee || []).forEach((e) => { map[e.employee_id] = e })
    return map
  }, [report])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return (employees || []).filter(
      (e) => !q || (e.full_name || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q)
    )
  }, [employees, search])

  const activeCount = (employees || []).filter((e) => e.is_active).length

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    const { error } = await shopService.regenerateInviteCode()
    setRegenerating(false)
    setConfirmRegen(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Invite code regenerated')
      refreshProfile()
    }
  }

  const handleToggle = async () => {
    setBusy(true)
    const { error } = await shopService.setEmployeeActive(toggling.id, !toggling.is_active)
    setBusy(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(toggling.is_active ? 'Employee deactivated' : 'Employee reactivated')
      setToggling(null)
      refetch()
    }
  }

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-[24px]">
      <PageHeader title="Employees" subtitle={`${activeCount} active team ${activeCount === 1 ? 'member' : 'members'}`} />

      {/* Invite code card */}
      <div className="card-feature-cinematic flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px]">
        <div>
          <p className="text-eyebrow-cap uppercase text-shade-40 mb-[6px]">Shop Invite Code</p>
          <p className="text-heading-xl font-display tracking-widest text-on-primary">{inviteCode || '— — — —'}</p>
          <p className="text-caption text-shade-40 mt-[8px] max-w-md">
            Share this code with staff. They sign up with “Join a shop” and enter it to be added as an employee.
          </p>
        </div>
        <div className="flex gap-[8px] shrink-0">
          <button className="btn-aloe-pill flex items-center gap-[8px]" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="btn-outline-on-dark flex items-center gap-[8px]" onClick={() => setConfirmRegen(true)}
            disabled={regenerating}>
            <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} /> Regenerate
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card-standard py-[14px]">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
          <input className="search-input" placeholder="Search team…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="card-standard flex justify-center py-[64px]"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card-standard">
          <EmptyState icon={Users} title="No team members yet"
            subtitle="Share your invite code above so staff can join your shop." />
        </div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="th-cell">Member</th>
                  <th className="th-cell">Role</th>
                  <th className="th-cell">Phone</th>
                  <th className="th-cell">Joined</th>
                  <th className="th-cell">This Month</th>
                  <th className="th-cell">Status</th>
                  <th className="th-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const stats = statsByEmployee[emp.id]
                  const isSelf = emp.id === user?.id
                  return (
                    <tr key={emp.id} className="hover:bg-canvas-cream transition-colors">
                      <td className="td-cell">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-9 h-9 rounded-full bg-aloe-10 flex items-center justify-center text-eyebrow-cap font-medium text-ink shrink-0">
                            {getInitials(emp.full_name || emp.email)}
                          </div>
                          <div>
                            <p className="font-medium text-ink">{emp.full_name || '—'}{isSelf && <span className="text-shade-60 font-normal"> (you)</span>}</p>
                            <p className="text-caption text-shade-60">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="td-cell">
                        {emp.role === 'owner'
                          ? <span className="pill-tag-mint">Owner</span>
                          : <span className="pill-tag-shade">Employee</span>}
                      </td>
                      <td className="td-cell text-body-md text-shade-60">{emp.phone || '—'}</td>
                      <td className="td-cell text-body-md text-shade-60">{formatDate(emp.created_at, 'dd MMM yyyy')}</td>
                      <td className="td-cell text-body-md">
                        {stats ? (
                          <span className="text-ink">{formatUGX(stats.total)} <span className="text-shade-60">· {stats.tx_count} sales</span></span>
                        ) : <span className="text-shade-40">No sales</span>}
                      </td>
                      <td className="td-cell">
                        {emp.is_active
                          ? <span className="badge-green">Active</span>
                          : <span className="badge-red">Inactive</span>}
                      </td>
                      <td className="td-cell">
                        {emp.role === 'owner' ? (
                          <span className="text-caption text-shade-40">—</span>
                        ) : (
                          <button className={`btn-ghost ${emp.is_active ? 'text-[#991b1b] hover:bg-[#fee2e2]' : 'text-[#15803d] hover:bg-aloe-10'}`}
                            title={emp.is_active ? 'Deactivate' : 'Reactivate'} onClick={() => setToggling(emp)}>
                            {emp.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmRegen}
        onClose={() => setConfirmRegen(false)}
        onConfirm={handleRegenerate}
        title="Regenerate invite code"
        message="The current code will stop working immediately. Anyone you've already shared it with will need the new code. Existing employees are not affected."
        confirmLabel="Regenerate"
        loading={regenerating}
      />

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        onConfirm={handleToggle}
        title={toggling?.is_active ? 'Deactivate employee' : 'Reactivate employee'}
        message={
          toggling?.is_active
            ? `${toggling?.full_name || toggling?.email} will be signed out and unable to log in or record sales. Their sales history is kept.`
            : `${toggling?.full_name || toggling?.email} will be able to log in and record sales again.`
        }
        confirmLabel={toggling?.is_active ? 'Deactivate' : 'Reactivate'}
        danger={toggling?.is_active}
        loading={busy}
      />
    </div>
  )
}
