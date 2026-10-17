import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Purchase Detail' }
export const dynamic = 'force-dynamic'

export default async function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, model: true, barcode: true } } },
      },
      supplier: true,
      createdBy: { select: { name: true } },
    },
  }).catch(() => null)

  if (!purchase) notFound()

  const total = Number(purchase.totalAmount)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb + header */}
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/purchases" className="hover:text-primary transition-colors">Purchases</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-mono">{purchase.invoiceNo ?? purchase.id.slice(0, 8)}</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-extrabold text-on-surface">
              {purchase.invoiceNo ?? 'Purchase Entry'}
            </h1>
            <p className="text-on-surface-variant text-sm mt-0.5">
              {new Date(purchase.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' · '}by {purchase.createdBy.name}
            </p>
          </div>
          {session?.role === 'ADMIN' && (
            <Link
              href={`/admin/purchases/${purchase.id}/edit`}
              className="flex items-center gap-1.5 shrink-0 border border-primary/40 text-primary font-bold px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Supplier card */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
        <p className="text-xs text-on-surface-variant font-medium mb-2">Supplier</p>
        {purchase.supplier ? (
          <div>
            <p className="font-bold text-on-surface">{purchase.supplier.name}</p>
            {purchase.supplier.phone && (
              <a href={`tel:${purchase.supplier.phone}`} className="text-sm text-on-surface-variant hover:text-primary transition-colors block mt-1">
                {purchase.supplier.phone}
              </a>
            )}
            {purchase.supplier.gstin && (
              <p className="text-xs text-on-surface-variant mt-1 font-mono">GSTIN: {purchase.supplier.gstin}</p>
            )}
          </div>
        ) : (
          <p className="text-on-surface-variant text-sm">No supplier linked</p>
        )}
      </div>

      {/* Items table */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container">
          <h2 className="font-bold text-sm text-on-surface">Items ({purchase.items.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
              <tr>
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-right px-4 py-3">Cost Price</th>
                <th className="text-center px-4 py-3">Qty</th>
                <th className="text-right px-5 py-3">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {purchase.items.map((item) => {
                const lineTotal = item.qty * Number(item.costPrice)
                return (
                  <tr key={item.id} className="hover:bg-surface-container/50">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-on-surface text-xs">{item.product.name}</p>
                      {item.product.model && <p className="text-[10px] text-on-surface-variant">{item.product.model}</p>}
                      {item.product.barcode && <p className="text-[10px] font-mono text-on-surface-variant">{item.product.barcode}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-on-surface">{formatPrice(Number(item.costPrice))}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-xs">{item.qty}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-on-surface">{formatPrice(lineTotal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="border-t border-outline-variant/40 px-5 py-4 bg-surface-container/30">
          <div className="flex justify-between font-extrabold text-base text-on-surface">
            <span>Total Cost</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {purchase.notes && (
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Notes</p>
          <p className="text-sm text-on-surface">{purchase.notes}</p>
        </div>
      )}
    </div>
  )
}
