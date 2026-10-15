import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { updateCustomer } from '@/actions/customers'
import CustomerEditForm from './_client'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const c = await prisma.customer.findUnique({ where: { id }, select: { name: true } }).catch(() => null)
  return { title: c ? `${c.name} — Customer` : 'Customer' }
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, invoiceNo: true, totalAmount: true, paymentMode: true, createdAt: true },
      },
      quotations: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, quoteNo: true, totalAmount: true, status: true, createdAt: true },
      },
    },
  }).catch(() => null)

  if (!customer) notFound()

  const totalSpent = customer.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
  const lastSale = customer.sales[0]

  const action = updateCustomer.bind(null, customer.id)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant">
        <Link href="/admin/customers" className="hover:text-primary transition-colors">Customers</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-semibold">{customer.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </div>
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">{customer.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">call</span>
                {customer.phone}
              </a>
            )}
            {customer.email && (
              <a href={`mailto:${customer.email}`} className="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">mail</span>
                {customer.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: customer.sales.length, icon: 'receipt_long' },
          { label: 'Total Spent', value: formatPrice(totalSpent), icon: 'payments' },
          { label: 'Quotations', value: customer.quotations.length, icon: 'description' },
          { label: 'Last Purchase', value: lastSale ? new Date(lastSale.createdAt).toLocaleDateString('en-IN') : '—', icon: 'calendar_today' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-outline-variant/40 p-4">
            <span className="material-symbols-outlined text-xl text-primary/60">{s.icon}</span>
            <p className="font-headline text-lg font-extrabold text-on-surface mt-1">{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-4">
          <h2 className="font-bold text-sm text-on-surface">Customer Info</h2>
          <CustomerEditForm customer={customer} action={action} />
        </div>

        {/* WhatsApp quick actions */}
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-4">
          <h2 className="font-bold text-sm text-on-surface">Quick Actions</h2>
          <div className="space-y-3">
            {customer.phone ? (
              <>
                <a
                  href={`https://wa.me/91${customer.phone.replace(/\D/g, '')}?text=Hi ${customer.name}, this is MK Refrigeration Bharuch. How can we help you?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#25D366]/30 bg-[#f0fdf4] hover:bg-[#dcfce7] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-[#128C7E]">WhatsApp Message</p>
                    <p className="text-xs text-on-surface-variant">Open chat with {customer.name}</p>
                  </div>
                </a>
                <a
                  href={`tel:${customer.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl text-primary">call</span>
                  <div>
                    <p className="text-sm font-bold text-primary">Call Customer</p>
                    <p className="text-xs text-on-surface-variant">{customer.phone}</p>
                  </div>
                </a>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant">No phone number on file.</p>
            )}
            {customer.address && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container">
                <span className="material-symbols-outlined text-xl text-on-surface-variant mt-0.5">location_on</span>
                <p className="text-sm text-on-surface-variant">{customer.address}</p>
              </div>
            )}
            {customer.gstin && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container">
                <span className="material-symbols-outlined text-xl text-on-surface-variant">badge</span>
                <div>
                  <p className="text-xs text-on-surface-variant">GSTIN</p>
                  <p className="text-sm font-mono font-bold text-on-surface">{customer.gstin}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales history */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/40 flex items-center justify-between">
          <h2 className="font-bold text-sm text-on-surface">Purchase History</h2>
          <span className="text-xs text-on-surface-variant">{customer.sales.length} sale{customer.sales.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Invoice</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {customer.sales.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-on-surface-variant text-sm">No purchases yet.</td></tr>
              ) : customer.sales.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-on-surface text-xs">{s.invoiceNo}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold bg-surface-container px-2 py-0.5 rounded-lg">{s.paymentMode}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-on-surface">{formatPrice(Number(s.totalAmount))}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/sales/${s.id}/invoice`} className="text-xs text-primary hover:underline font-medium">Invoice</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotations history */}
      {customer.quotations.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/40 flex items-center justify-between">
            <h2 className="font-bold text-sm text-on-surface">Quotations</h2>
            <span className="text-xs text-on-surface-variant">{customer.quotations.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container text-xs text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Quote No</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-5 py-3">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {customer.quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-on-surface text-xs">{q.quoteNo}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{new Date(q.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        q.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700' :
                        q.status === 'REJECTED' ? 'bg-error/10 text-error' :
                        q.status === 'EXPIRED' ? 'bg-surface-container text-on-surface-variant' :
                        'bg-amber-50 text-amber-700'
                      }`}>{q.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-on-surface">{formatPrice(Number(q.totalAmount))}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/quotations/${q.id}/pdf`} className="text-xs text-primary hover:underline font-medium">PDF</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
