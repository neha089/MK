import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const s = await prisma.supplier.findUnique({ where: { id }, select: { name: true } }).catch(() => null)
  return { title: s ? `${s.name} — Supplier` : 'Supplier' }
}

export const dynamic = 'force-dynamic'

export default async function SupplierDetailPage({ params }: Props) {
  const { id } = await params

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchases: {
        orderBy: { purchaseDate: 'desc' },
        select: {
          id: true,
          invoiceNo: true,
          totalAmount: true,
          purchaseDate: true,
          items: { select: { qty: true } },
          createdBy: { select: { name: true } },
        },
      },
    },
  }).catch(() => null)

  if (!supplier) notFound()

  const totalSpent = supplier.purchases.reduce((s, p) => s + Number(p.totalAmount), 0)
  const totalItems = supplier.purchases.reduce((s, p) => s + p.items.reduce((a, i) => a + i.qty, 0), 0)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant">
        <Link href="/admin/suppliers" className="hover:text-primary transition-colors">Suppliers</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-semibold">{supplier.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>store</span>
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold text-on-surface">{supplier.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {supplier.phone && (
                <a href={`tel:${supplier.phone}`} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">call</span>
                  {supplier.phone}
                </a>
              )}
              {supplier.email && (
                <a href={`mailto:${supplier.email}`} className="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  {supplier.email}
                </a>
              )}
            </div>
          </div>
        </div>
        <Link
          href={`/admin/suppliers/${supplier.id}/edit`}
          className="flex items-center gap-1.5 shrink-0 border border-primary/40 text-primary font-bold px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-base">edit</span>
          Edit
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: supplier.purchases.length, icon: 'shopping_bag' },
          { label: 'Total Spent', value: formatPrice(totalSpent), icon: 'payments' },
          { label: 'Items Received', value: totalItems, icon: 'inventory_2' },
          { label: 'Last Purchase', value: supplier.purchases[0] ? new Date(supplier.purchases[0].purchaseDate).toLocaleDateString('en-IN') : '—', icon: 'calendar_today' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-outline-variant/40 p-4">
            <span className="material-symbols-outlined text-xl text-primary/60">{s.icon}</span>
            <p className="font-headline text-lg font-extrabold text-on-surface mt-1">{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Supplier Info */}
      {(supplier.address || supplier.gstin) && (
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5 space-y-3">
          <h2 className="font-bold text-sm text-on-surface">Details</h2>
          {supplier.address && (
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-xl text-on-surface-variant mt-0.5">location_on</span>
              <p className="text-sm text-on-surface-variant">{supplier.address}</p>
            </div>
          )}
          {supplier.gstin && (
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-on-surface-variant">badge</span>
              <div>
                <p className="text-xs text-on-surface-variant">GSTIN</p>
                <p className="text-sm font-mono font-bold text-on-surface">{supplier.gstin}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchase History */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/40 flex items-center justify-between">
          <h2 className="font-bold text-sm text-on-surface">Purchase History</h2>
          <span className="text-xs text-on-surface-variant">{supplier.purchases.length} purchase{supplier.purchases.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Invoice</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">By</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {supplier.purchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-on-surface-variant text-sm">No purchases yet.</td>
                </tr>
              ) : supplier.purchases.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-on-surface text-xs">{p.invoiceNo ?? p.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">
                    {new Date(p.purchaseDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{p.createdBy.name}</td>
                  <td className="px-5 py-3 text-right font-bold text-on-surface">{formatPrice(Number(p.totalAmount))}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/purchases/${p.id}`} className="text-xs text-primary hover:underline font-medium">View</Link>
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
