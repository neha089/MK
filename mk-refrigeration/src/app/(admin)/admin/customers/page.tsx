import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Customers' }
export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { sales: true, quotations: true } },
      sales: { select: { totalAmount: true } },
    },
  }).catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Customers</h1>
          <p className="text-on-surface-variant text-sm mt-1">{customers.length} total customers</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/api/admin/export/customers" className="flex items-center gap-1.5 shrink-0 border border-outline-variant/60 text-on-surface-variant font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </a>
          <Link href="/admin/customers/new" className="btn-primary">
            <span className="material-symbols-outlined text-xl">person_add</span>
            Add Customer
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Name</th>
                <th className="text-left px-4 py-3.5">Phone</th>
                <th className="text-left px-4 py-3.5">Address</th>
                <th className="text-center px-4 py-3.5">Sales</th>
                <th className="text-right px-4 py-3.5">Total Spent</th>
                <th className="text-left px-4 py-3.5">Since</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-on-surface-variant">
                    No customers yet. They are created automatically when you record a sale.
                  </td>
                </tr>
              ) : customers.map((c) => {
                const totalSpent = c.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
                return (
                  <tr key={c.id} className="hover:bg-surface-container/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/customers/${c.id}`} className="font-bold text-on-surface group-hover:text-primary transition-colors">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      {c.phone
                        ? <a href={`tel:${c.phone}`} className="text-primary font-medium hover:underline">{c.phone}</a>
                        : <span className="text-on-surface-variant">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-on-surface-variant text-xs max-w-[160px] truncate">{c.address ?? '—'}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-on-surface">{c._count.sales}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-on-surface">{formatPrice(totalSpent)}</td>
                    <td className="px-4 py-3.5 text-on-surface-variant text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-xs text-primary font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
