import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { updateQuotationStatus } from '@/actions/quotations'

export const metadata: Metadata = { title: 'Quotations' }
export const dynamic = 'force-dynamic'

const statusColor: Record<string, string> = {
  PENDING: 'bg-warning/10 text-warning border-warning/20',
  ACCEPTED: 'bg-success/10 text-success border-success/20',
  REJECTED: 'bg-error/10 text-error border-error/20',
  EXPIRED: 'bg-surface-container text-on-surface-variant border-outline-variant/40',
}

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { items: { include: { product: { select: { name: true } } } } },
  }).catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Quotations</h1>
          <p className="text-on-surface-variant text-sm mt-1">Recent {quotations.length} quotations</p>
        </div>
        <Link href="/admin/quotations/new" className="btn-primary">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>request_quote</span>
          New Quotation
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Quote No</th>
                <th className="text-left px-4 py-3.5">Customer</th>
                <th className="text-left px-4 py-3.5">Items</th>
                <th className="text-right px-4 py-3.5">Total</th>
                <th className="text-center px-4 py-3.5">Status</th>
                <th className="text-center px-4 py-3.5">Valid Days</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {quotations.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-on-surface-variant">No quotations yet.</td></tr>
              ) : quotations.map((q) => (
                <tr key={q.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-primary text-xs">{q.quoteNo}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-on-surface">{q.customerName ?? '—'}</p>
                    {q.customerPhone && <p className="text-xs text-on-surface-variant">{q.customerPhone}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">
                    {q.items.map((i) => i.product.name).join(', ')}
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-on-surface">{formatPrice(Number(q.totalAmount))}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor[q.status] ?? ''}`}>{q.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center text-on-surface-variant text-xs">{q.validDays} days</td>
                  <td className="px-4 py-3.5">
                    {q.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <form action={updateQuotationStatus.bind(null, q.id, 'ACCEPTED')}>
                          <button type="submit" className="p-1.5 hover:bg-success/10 rounded-lg text-on-surface-variant hover:text-success transition-colors" title="Accept">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                          </button>
                        </form>
                        <form action={updateQuotationStatus.bind(null, q.id, 'REJECTED')}>
                          <button type="submit" className="p-1.5 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors" title="Reject">
                            <span className="material-symbols-outlined text-base">cancel</span>
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
