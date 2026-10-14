import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Customers' }
export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { sales: true, quotations: true } } },
  }).catch(() => [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Customers</h1>
        <p className="text-on-surface-variant text-sm mt-1">{customers.length} total customers</p>
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
                <th className="text-center px-4 py-3.5">Quotations</th>
                <th className="text-left px-4 py-3.5">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-on-surface-variant">No customers yet. They are created automatically when you make a sale.</td></tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-on-surface">{c.name}</td>
                  <td className="px-4 py-3.5">
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="text-primary font-medium hover:underline">{c.phone}</a>
                    ) : <span className="text-on-surface-variant">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">{c.address ?? '—'}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-on-surface">{c._count.sales}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-on-surface">{c._count.quotations}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
