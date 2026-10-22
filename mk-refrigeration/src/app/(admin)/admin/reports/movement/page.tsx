import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'

export const metadata: Metadata = { title: 'Stock Movement' }
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ type?: string; product?: string }>

export default async function StockMovementPage({ searchParams }: { searchParams: SearchParams }) {
  const { type, product } = await searchParams

  const where = {
    ...(type && ['IN', 'OUT', 'ADJUST'].includes(type) ? { type: type as 'IN' | 'OUT' | 'ADJUST' } : {}),
    ...(product ? { productId: product } : {}),
  }

  const [logs, counts, products] = await Promise.all([
    prisma.inventoryLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { product: { select: { id: true, name: true, model: true } } },
    }),
    prisma.inventoryLog.groupBy({
      by: ['type'],
      _count: { id: true },
    }),
    prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]).catch(() => [[], [], []] as [never[], never[], never[]])

  const typeCount = Object.fromEntries((counts as { type: string; _count: { id: number } }[]).map((c) => [c.type, c._count.id]))

  const typeLabel: Record<string, string> = { IN: 'Stock In', OUT: 'Stock Out', ADJUST: 'Adjustment' }
  const typeBadge: Record<string, string> = {
    IN: 'bg-success/10 text-success border-success/20',
    OUT: 'bg-error/10 text-error border-error/20',
    ADJUST: 'bg-primary/10 text-primary border-primary/20',
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/reports" className="hover:text-primary transition-colors">Reports</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Stock Movement</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-extrabold text-on-surface">Stock Movement Log</h1>
            <p className="text-on-surface-variant text-sm mt-0.5">All inventory IN / OUT / ADJUST events</p>
          </div>
          <a href="/api/admin/export/inventory" className="flex items-center gap-1.5 shrink-0 border border-outline-variant/60 text-on-surface-variant font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/reports/movement"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${!type ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'}`}
        >
          All ({Object.values(typeCount).reduce((a, b) => a + b, 0)})
        </Link>
        {(['IN', 'OUT', 'ADJUST'] as const).map((t) => (
          <Link
            key={t}
            href={`/admin/reports/movement?type=${t}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${type === t ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'}`}
          >
            {typeLabel[t]} ({typeCount[t] ?? 0})
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Time</th>
                <th className="text-left px-4 py-3.5">Product</th>
                <th className="text-center px-4 py-3.5">Type</th>
                <th className="text-right px-4 py-3.5">Qty</th>
                <th className="text-left px-4 py-3.5">Note</th>
                <th className="text-left px-4 py-3.5">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {(logs as { id: string; createdAt: Date; type: string; qty: number; note: string | null; refId: string | null; product: { name: string; model: string | null } }[]).map((l) => (
                <tr key={l.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    {' '}
                    <span className="font-mono">{new Date(l.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-on-surface text-xs">{l.product.name}</p>
                    {l.product.model && <p className="text-[10px] text-on-surface-variant">{l.product.model}</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge[l.type] ?? 'bg-surface-container text-on-surface-variant border-outline-variant/40'}`}>
                      {typeLabel[l.type] ?? l.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-bold text-sm ${l.type === 'OUT' ? 'text-error' : l.type === 'IN' ? 'text-success' : 'text-primary'}`}>
                    {l.type === 'OUT' ? '−' : '+'}{Math.abs(l.qty)}
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{l.note ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{l.refId ?? '—'}</td>
                </tr>
              ))}
              {(logs as unknown[]).length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-on-surface-variant">No movement records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {(logs as unknown[]).length === 200 && (
          <div className="px-5 py-3 text-xs text-on-surface-variant border-t border-outline-variant/40 bg-surface-container/50">
            Showing latest 200 events
          </div>
        )}
      </div>
    </div>
  )
}
