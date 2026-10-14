import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Sales' }
export const dynamic = 'force-dynamic'

export default async function SalesPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { items: { include: { product: { select: { name: true } } } } },
  }).catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Sales & Billing</h1>
          <p className="text-on-surface-variant text-sm mt-1">Recent {sales.length} bills</p>
        </div>
        <Link href="/admin/sales/new" className="btn-primary">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          New Bill
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Invoice No</th>
                <th className="text-left px-4 py-3.5">Customer</th>
                <th className="text-left px-4 py-3.5">Items</th>
                <th className="text-right px-4 py-3.5">Total</th>
                <th className="text-left px-4 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {sales.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-on-surface-variant">No sales yet.</td></tr>
              ) : sales.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-primary text-xs">{s.invoiceNo}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-on-surface">{s.customerName ?? '—'}</p>
                    {s.customerPhone && <p className="text-xs text-on-surface-variant">{s.customerPhone}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">
                    {s.items.map((i) => i.product.name).join(', ')}
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-on-surface">{formatPrice(Number(s.totalAmount))}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">
                    {new Date(s.createdAt).toLocaleDateString('en-IN')}
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
