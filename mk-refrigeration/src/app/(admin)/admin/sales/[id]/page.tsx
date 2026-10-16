import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { getSession } from '@/lib/session'
import CancelSaleButton from './_cancel'

export const metadata: Metadata = { title: 'Sale Detail' }
export const dynamic = 'force-dynamic'

const paymentBadge: Record<string, string> = {
  CASH: 'bg-success/10 text-success border-success/20',
  CARD: 'bg-primary/10 text-primary border-primary/20',
  UPI: 'bg-warning/10 text-warning border-warning/20',
  CREDIT: 'bg-error/10 text-error border-error/20',
}

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, model: true, barcode: true } } },
      },
      createdBy: { select: { name: true } },
      customer: { select: { id: true, name: true } },
    },
  }).catch(() => null)

  if (!sale) notFound()

  const subtotal = Number(sale.subtotal)
  const discount = Number(sale.discount)
  const gst = Number(sale.gstAmount)
  const total = Number(sale.totalAmount)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb + actions */}
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/sales" className="hover:text-primary transition-colors">Sales & Billing</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-mono">{sale.invoiceNo}</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-extrabold text-on-surface">{sale.invoiceNo}</h1>
            <p className="text-on-surface-variant text-sm mt-0.5">
              {new Date(sale.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' · '}by {sale.createdBy.name}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {sale.status === 'CANCELLED' && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-error/10 text-error border border-error/20">
                CANCELLED
              </span>
            )}
            {sale.status === 'COMPLETED' && session?.role === 'ADMIN' && (
              <CancelSaleButton saleId={sale.id} />
            )}
            <Link
              href={`/admin/sales/${sale.id}/invoice`}
              target="_blank"
              className="flex items-center gap-1.5 shrink-0 bg-primary text-on-primary font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Print Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Customer + Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-2">Customer</p>
          {sale.customer ? (
            <Link href={`/admin/customers/${sale.customer.id}`} className="font-bold text-on-surface hover:text-primary transition-colors">
              {sale.customerName ?? sale.customer.name}
            </Link>
          ) : (
            <p className="font-bold text-on-surface">{sale.customerName ?? '—'}</p>
          )}
          {sale.customerPhone && (
            <a href={`tel:${sale.customerPhone}`} className="text-sm text-on-surface-variant hover:text-primary transition-colors block mt-1">
              {sale.customerPhone}
            </a>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-2">Payment</p>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${paymentBadge[sale.paymentMode] ?? 'bg-surface-container text-on-surface-variant border-outline-variant/40'}`}>
            {sale.paymentMode}
          </span>
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container">
          <h2 className="font-bold text-sm text-on-surface">Items ({sale.items.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
              <tr>
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-right px-4 py-3">Unit Price</th>
                <th className="text-right px-4 py-3">Discount</th>
                <th className="text-center px-4 py-3">Qty</th>
                <th className="text-right px-5 py-3">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {sale.items.map((item) => {
                const lineTotal = item.qty * Number(item.price) - Number(item.discount)
                return (
                  <tr key={item.id} className="hover:bg-surface-container/50">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-on-surface text-xs">{item.product.name}</p>
                      {item.product.model && <p className="text-[10px] text-on-surface-variant">{item.product.model}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-on-surface">{formatPrice(Number(item.price))}</td>
                    <td className="px-4 py-3.5 text-right text-xs text-on-surface-variant">
                      {Number(item.discount) > 0 ? `−${formatPrice(Number(item.discount))}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-xs">{item.qty}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-on-surface">{formatPrice(lineTotal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-outline-variant/40 px-5 py-4 space-y-2 bg-surface-container/30">
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs text-error">
              <span>Discount</span><span>−{formatPrice(discount)}</span>
            </div>
          )}
          {gst > 0 && (
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>GST</span><span>{formatPrice(gst)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-base text-on-surface pt-2 border-t border-outline-variant/40">
            <span>Total</span><span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {sale.notes && (
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Notes</p>
          <p className="text-sm text-on-surface">{sale.notes}</p>
        </div>
      )}
    </div>
  )
}
