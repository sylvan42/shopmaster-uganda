import { useState } from 'react'
import { Users, Search, Plus, Edit2, UserX } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { formatDate } from '../lib/formatters'

const EMPLOYEES = [
  { id: 1, name: 'Nakato Sarah', role: 'admin', email: 'sarah@shopmaster.com', phone: '+256 772 100 200', joined: '2024-01-15', status: 'active' },
  { id: 2, name: 'Ssemakula James', role: 'employee', email: 'james@shopmaster.com', phone: '+256 753 234 567', joined: '2024-02-20', status: 'active' },
  { id: 3, name: 'Akello Grace', role: 'employee', email: 'grace@shopmaster.com', phone: '+256 782 345 678', joined: '2024-03-10', status: 'active' },
  { id: 4, name: 'Mugisha David', role: 'employee', email: 'david@shopmaster.com', phone: '+256 704 456 789', joined: '2024-04-05', status: 'inactive' },
  { id: 5, name: 'Namutebi Fatuma', role: 'employee', email: 'fatuma@shopmaster.com', phone: '+256 712 567 890', joined: '2024-05-18', status: 'active' },
]

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

export const Employees = () => {
  const [search, setSearch] = useState('')

  const filtered = EMPLOYEES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-[24px]">
      <PageHeader
        title="Employees"
        subtitle={`${EMPLOYEES.filter(e => e.status === 'active').length} active team members`}
        action={
          <button className="btn-primary-pill flex items-center gap-[8px]">
            <Plus size={16} /> Add Employee
          </button>
        }
      />

      {/* Search */}
      <div className="card-standard py-[14px]">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
          <input
            className="search-input"
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="th-cell">Employee</th>
                <th className="th-cell">Role</th>
                <th className="th-cell">Phone</th>
                <th className="th-cell">Date Joined</th>
                <th className="th-cell">Status</th>
                <th className="th-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-0 border-0">
                    <EmptyState icon={Users} title="No employees found" subtitle="Try a different search or add a new team member." />
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-canvas-cream transition-colors">
                    <td className="td-cell">
                      <div className="flex items-center gap-[12px]">
                        <div className="w-9 h-9 rounded-full bg-aloe-10 flex items-center justify-center text-eyebrow-cap font-medium text-ink shrink-0">
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{emp.name}</p>
                          <p className="text-caption text-shade-60">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td-cell">
                      {emp.role === 'admin'
                        ? <span className="pill-tag-mint">Owner</span>
                        : <span className="pill-tag-shade">Employee</span>}
                    </td>
                    <td className="td-cell text-body-md text-shade-60">{emp.phone}</td>
                    <td className="td-cell text-body-md text-shade-60">{formatDate(emp.joined)}</td>
                    <td className="td-cell">
                      {emp.status === 'active'
                        ? <span className="badge-green">Active</span>
                        : <span className="badge-red">Inactive</span>}
                    </td>
                    <td className="td-cell">
                      <div className="flex items-center gap-[4px]">
                        <button className="btn-ghost" title="Edit"><Edit2 size={15} /></button>
                        <button className="btn-ghost text-[#991b1b] hover:bg-[#fee2e2]" title="Deactivate"><UserX size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
