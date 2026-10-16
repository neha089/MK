import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { updateQuotationStatus, convertQuotationToSale } from '@/actions/quotations'

export const metadata: Metadata = { title: 'Quotation Detail' }
export const dynamic = 'force-dynamic'

const statusColor: Record<string, string> = {
  PENDING: 'bg-warning/10 text-warning border-warning/20',
  ACCEPTED: 'bg-success/10 text-success border-success/20',
  REJECTED: 'bg-error/10 text-error border-error/20',
  EXPIRED: 'bg-surface-container text-on-surface-variant border-outline-variant/40',
}

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const quote = await prisma.quotation.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, model: true } } },
      },
      createdBy: { select: { name: true } },
      customer: { select: { id: true, name: true } },
    },
  }).catch(() => null)

  if (!quote) notFound()

  const subtotal = Number(quote.subtotal)
  const discount = Number(quote.discount)
  const total = Number(quote.totalAmount)
  const expiryDate = new Date(quote.createdAt)
  expiryDate.setDate(expiryDate.getDate() + quote.validDays)
  const isExpired = expiryDate < new Date()

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb + header */}
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/quotations" className="hover:text-primary transition-colors">Quotations</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-mono">{quote.quoteNo}</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline text-2xl font-extrabold text-on-surface">{quote.quoteNo}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor[quote.status] ?? ''}`}>
                {quote.status}
              </span>
            </div>
            <p className="text-on-surface-variant text-sm mt-0.5">
              {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' · '}by {quote.createdBy.name}
              {' · '}Valid {quote.validDays} days
              {isExpired && quote.status === 'PENDING' && <span className="text-error ml-1">(expired)</span>}
            </p>
          </div>
          <Link
            href={`/admin/quotations/${quote.id}/pdf`}
            target="_blank"
            className="flex items-center gap-1.5 shrink-0 border border-outline-variant/60 text-on-surface-variant font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            PDF
          </Link>
        </div>
      </div>

      {/* Actions for PENDING */}
      {quote.status === 'PENDING' && (
        <div className="flex gap-3">
          <form action={convertQuotationToSale.bind(null, quote.id)}>
            <button type="submit" className="flex items-center gap-2 bg-primary text-on-primary font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>point_of_sale</span>
              Convert to Sale
            </button>
          </form>
          <form action={updateQuotationStatus.bind(null, quote.id, 'ACCEPTED')}>
            <button type="submit" className="flex items-center gap-2 border border-success text-success font-bold px-4 py-2.5 rounded-xl hover:bg-success/10 transition-colors text-sm">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Mark Accepted
            </button>
          </form>
          <form action={updateQuotationStatus.bind(null, quote.id, 'REJECTED')}>
            <button type="submit" className="flex items-center gap-2 border border-error text-error font-bold px-4 py-2.5 rounded-xl hover:bg-error/10 transition-colors text-sm">
              <span className="material-symbols-outlined text-base">cancel</span>
              Reject
            </button>
          </form>
        </div>
      )}

      {/* Customer */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
        <p className="text-xs text-on-surface-variant font-medium mb-2">Customer</p>
        {quote.customer ? (
          <Link href={`/admin/customers/${quote.customer.id}`} className="font-bold text-on-surface hover:text-primary transition-colors">
            {quote.customerName ?? quote.customer.name}
          </Link>
        ) : (
          <p className="font-bold text-on-surface">{quote.customerName ?? '—'}</p>
        )}
        {quote.customerPhone && (
          <a href={`tel:${quote.customerPhone}`} className="text-sm text-on-surface-variant hover:text-primary transition-colors block mt-1">
            {quote.customerPhone}
          </a>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container">
          <h2 className="font-bold text-sm text-on-surface">Items ({quote.items.length})</h2>
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
              {quote.items.map((item) => {
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
          <div className="flex justify-between font-extrabold text-base text-on-surface pt-2 border-t border-outline-variant/40">
            <span>Total</span><span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Notes</p>
          <p className="text-sm text-on-surface">{quote.notes}</p>
        </div>
      )}
    </div>
  )
}
