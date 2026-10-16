import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'

export const metadata: Metadata = { title: 'Enquiry Analytics' }
export const dynamic = 'force-dynamic'

export default async function EnquiryAnalyticsPage() {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [total, thisMonth, lastMonth, last7Days, byStatus, recent, daily] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.enquiry.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.enquiry.count({ where: { createdAt: { gte: last7 } } }),
    prisma.enquiry.groupBy({ by: ['status'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, name: true, phone: true, product: true, status: true, read: true, createdAt: true },
    }),
    // Daily counts for last 14 days
    prisma.$queryRaw<{ day: string; count: number }[]>`
      SELECT DATE("createdAt")::text AS day, COUNT(*)::int AS count
      FROM "Enquiry"
      WHERE "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
  ]).catch(() => [0, 0, 0, 0, [], [], []] as [number, number, number, number, never[], never[], never[]])

  const statusColor: Record<string, string> = {
    NEW: 'bg-primary/10 text-primary border-primary/20',
    CONTACTED: 'bg-warning/10 text-warning border-warning/20',
    CONVERTED: 'bg-success/10 text-success border-success/20',
    CLOSED: 'bg-surface-container text-on-surface-variant border-outline-variant/40',
  }

  const growth = lastMonth > 0 ? (((thisMonth as number) - lastMonth) / lastMonth) * 100 : null

  const maxDaily = Math.max(...(daily as { count: number }[]).map((d) => d.count), 1)

  return (
    <div className="space-y-8">
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/reports" className="hover:text-primary transition-colors">Reports</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Enquiry Analytics</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Enquiry Analytics</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Volume, status breakdown, and recent enquiries</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Total Enquiries</p>
          <p className="text-2xl font-extrabold font-headline text-on-surface">{total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">This Month</p>
          <p className="text-2xl font-extrabold font-headline text-primary">{thisMonth}</p>
          {growth !== null && (
            <p className={`text-xs mt-1 font-semibold ${(growth as number) >= 0 ? 'text-success' : 'text-error'}`}>
              {(growth as number) >= 0 ? '+' : ''}{(growth as number).toFixed(1)}% vs last month
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Last 7 Days</p>
          <p className="text-2xl font-extrabold font-headline text-on-surface">{last7Days}</p>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Last Month</p>
          <p className="text-2xl font-extrabold font-headline text-on-surface">{lastMonth}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/40 p-5">
          <h2 className="font-bold text-sm text-on-surface mb-4">Last 14 Days</h2>
          {(daily as { day: string; count: number }[]).length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-8">No data yet</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {(daily as { day: string; count: number }[]).map((d) => {
                const h = (d.count / maxDaily) * 100
                const date = new Date(d.day)
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end h-24">
                      <div
                        className="w-full rounded-t-md bg-primary/70 hover:bg-primary transition-colors"
                        style={{ height: `${h}%` }}
                        title={`${d.day}: ${d.count} enquiries`}
                      />
                    </div>
                    <p className="text-[9px] text-on-surface-variant">{date.getDate()}/{date.getMonth() + 1}</p>
                    <p className="text-[9px] font-bold text-on-surface">{d.count}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container">
            <h2 className="font-bold text-sm text-on-surface">By Status</h2>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {(byStatus as { status: string; _count: { id: number } }[]).map((s) => (
              <div key={s.status} className="px-5 py-3 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor[s.status] ?? 'bg-surface-container text-on-surface-variant border-outline-variant/40'}`}>
                  {s.status}
                </span>
                <span className="font-bold text-sm text-on-surface">{s._count.id}</span>
              </div>
            ))}
            {(byStatus as unknown[]).length === 0 && (
              <p className="px-5 py-8 text-xs text-on-surface-variant text-center">No enquiries yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent enquiries */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container flex items-center justify-between">
          <h2 className="font-bold text-sm text-on-surface">Recent Enquiries</h2>
          <Link href="/admin/enquiries" className="text-xs text-primary font-bold hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
              <tr>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Product Interest</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {(recent as { id: string; name: string; phone: string; product: string | null; status: string; read: boolean; createdAt: Date }[]).map((e) => (
                <tr key={e.id} className={`hover:bg-surface-container/50 transition-colors ${!e.read ? 'font-semibold' : ''}`}>
                  <td className="px-5 py-3 text-on-surface text-xs">{e.name}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:${e.phone}`} className="text-xs text-on-surface-variant hover:text-primary transition-colors">{e.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{e.product ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor[e.status] ?? 'bg-surface-container text-on-surface-variant border-outline-variant/40'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[10px] text-on-surface-variant">
                    {new Date(e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
              {(recent as unknown[]).length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-on-surface-variant text-xs">No enquiries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
