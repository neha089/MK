import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Purchases' }
export const dynamic = 'force-dynamic'

export default async function PurchasesPage() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { supplier: true, createdBy: true, items: { include: { product: { select: { name: true } } } } },
  }).catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Purchases / Inload</h1>
          <p className="text-on-surface-variant text-sm mt-1">Recent {purchases.length} purchase entries</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export/purchases"
            className="flex items-center gap-2 border border-outline-variant/60 text-on-surface-variant font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </a>
          <Link href="/admin/purchases/new" className="btn-primary">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory</span>
            New Inload
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Invoice No</th>
                <th className="text-left px-4 py-3.5">Supplier</th>
                <th className="text-left px-4 py-3.5">Items</th>
                <th className="text-right px-4 py-3.5">Total Cost</th>
                <th className="text-left px-4 py-3.5">Date</th>
                <th className="text-left px-4 py-3.5">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {purchases.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-on-surface-variant">No purchases yet.</td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-primary text-xs">{p.invoiceNo ?? '—'}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">{p.supplier?.name ?? '—'}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">
                    {p.items.map((i) => i.product.name).join(', ')}
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-on-surface">{formatPrice(Number(p.totalAmount))}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">{p.createdBy.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
