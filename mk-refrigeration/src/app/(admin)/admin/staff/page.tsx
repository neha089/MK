import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { deleteStaff } from '@/actions/staff'
import AddStaffForm from './_add'

export const metadata: Metadata = { title: 'Staff' }
export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const staff = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } }).catch(() => [])

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-headline text-2xl font-extrabold text-on-surface">Staff Management</h1>

      <AddStaffForm />

      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container">
          <h2 className="font-bold text-sm text-on-surface">Team ({staff.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-container/50 border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-center px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {staff.map((u) => (
              <tr key={u.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-5 py-3.5 font-bold text-on-surface">{u.name}</td>
                <td className="px-4 py-3.5 text-on-surface-variant text-xs">{u.email}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${u.role === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container text-on-surface-variant border-outline-variant/40'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-on-surface-variant text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3.5">
                  <form action={deleteStaff.bind(null, u.id)}>
                    <button
                      type="submit"
                      onClick={(e) => { if (!confirm(`Remove ${u.name}?`)) e.preventDefault() }}
                      className="p-1.5 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-on-surface-variant">No staff yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
