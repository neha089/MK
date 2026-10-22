import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

export const metadata: Metadata = { title: 'Audit Log' }
export const dynamic = 'force-dynamic'

const ACTION_COLOR: Record<string, string> = {
  LOGIN_SUCCESS: 'bg-success/10 text-success',
  LOGIN_FAIL: 'bg-error/10 text-error',
  LOGOUT: 'bg-surface-container text-on-surface-variant',
  ENQUIRY_SUBMIT: 'bg-primary/10 text-primary',
  CREATE_SALE: 'bg-emerald-50 text-emerald-700',
  CREATE_PURCHASE: 'bg-blue-50 text-blue-700',
  CREATE_PRODUCT: 'bg-violet-50 text-violet-700',
  UPDATE_PRODUCT: 'bg-amber-50 text-amber-700',
  DELETE_PRODUCT: 'bg-error/10 text-error',
  ADJUST_STOCK: 'bg-orange-50 text-orange-700',
  CONVERT_QUOTATION: 'bg-teal-50 text-teal-700',
  CREATE_STAFF: 'bg-indigo-50 text-indigo-700',
  DELETE_STAFF: 'bg-error/10 text-error',
  CREATE_OFFER: 'bg-pink-50 text-pink-700',
  DELETE_OFFER: 'bg-error/10 text-error',
}

async function getLogs(action?: string) {
  try {
    return await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      where: action ? { action } : undefined,
    })
  } catch {
    return []
  }
}

async function getActionCounts() {
  try {
    return await prisma.auditLog.groupBy({
      by: ['action'],
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
    })
  } catch {
    return []
  }
}

type Props = { searchParams: Promise<{ action?: string }> }

export default async function AuditLogPage({ searchParams }: Props) {
  const { action } = await searchParams
  const [logs, counts] = await Promise.all([getLogs(action), getActionCounts()])

  const loginFails = counts.find((c) => c.action === 'LOGIN_FAIL')?._count.action ?? 0
  const totalActions = counts.reduce((s, c) => s + c._count.action, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Audit Log</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          {totalActions} total events · {loginFails > 0 && (
            <span className="text-error font-bold">{loginFails} failed login{loginFails !== 1 ? 's' : ''}</span>
          )}
        </p>
      </div>

      {/* Action filter chips */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/reports/audit"
          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${!action ? 'bg-primary text-on-primary border-primary' : 'bg-white text-on-surface-variant border-outline-variant/60 hover:border-primary hover:text-primary'}`}
        >
          All ({totalActions})
        </a>
        {counts.map((c) => (
          <a
            key={c.action}
            href={`/admin/reports/audit?action=${c.action}`}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${action === c.action ? 'bg-primary text-on-primary border-primary' : 'bg-white text-on-surface-variant border-outline-variant/60 hover:border-primary hover:text-primary'}`}
          >
            {c.action.replace(/_/g, ' ')} ({c._count.action})
          </a>
        ))}
      </div>

      {/* Log table */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Time</th>
                <th className="text-left px-4 py-3.5">Action</th>
                <th className="text-left px-4 py-3.5">User</th>
                <th className="text-left px-4 py-3.5">Entity</th>
                <th className="text-left px-4 py-3.5">Detail</th>
                <th className="text-left px-4 py-3.5">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-on-surface-variant">
                    No audit events yet. Events appear after logins and enquiries.
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3 text-xs text-on-surface-variant font-mono whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ACTION_COLOR[log.action] ?? 'bg-surface-container text-on-surface-variant'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{log.userEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">
                    {log.entity ? `${log.entity}${log.entityId ? ` #${log.entityId.slice(-6)}` : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[200px] truncate">{log.meta ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{log.ip ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 200 && (
          <div className="px-5 py-3 bg-surface-container/50 text-xs text-on-surface-variant border-t border-outline-variant/30">
            Showing latest 200 events
          </div>
        )}
      </div>
    </div>
  )
}
