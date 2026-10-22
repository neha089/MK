import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Sales Analytics' }
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ by?: string }>

export default async function SalesAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const { by = 'product' } = await searchParams
  const view = by === 'category' ? 'category' : 'product'

  const [productSales, categorySales, topCustomers, paymentBreakdown] = await Promise.all([
    prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { qty: true, price: true },
      _count: { id: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 20,
    }),
    prisma.$queryRaw<{ categoryName: string; total: number; units: number }[]>`
      SELECT c.name AS "categoryName",
             CAST(SUM(si.price * si.qty) AS FLOAT) AS total,
             SUM(si.qty)::int AS units
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      JOIN "Category" c ON p."categoryId" = c.id
      GROUP BY c.name
      ORDER BY total DESC
    `,
    prisma.sale.groupBy({
      by: ['customerName'],
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
      where: { customerName: { not: null } },
    }),
    prisma.sale.groupBy({
      by: ['paymentMode'],
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ]).catch(() => [[], [], [], []] as [never[], never[], never[], never[]])

  // Fetch product names for productSales
  const productIds = (productSales as { productId: string }[]).map((p) => p.productId)
  const products = productIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, model: true },
      }).catch(() => [])
    : []
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  const totalRevenue = (paymentBreakdown as { _sum: { totalAmount: { toNumber?: () => number } | null } }[])
    .reduce((s, p) => s + Number(p._sum.totalAmount ?? 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/reports" className="hover:text-primary transition-colors">Reports</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Sales Analytics</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Sales Analytics</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Top sellers, customer spend, payment breakdown</p>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <Link
          href="/admin/reports/sales?by=product"
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${view === 'product' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'}`}
        >
          By Product
        </Link>
        <Link
          href="/admin/reports/sales?by=category"
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${view === 'category' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'}`}
        >
          By Category
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top sellers table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container">
            <h2 className="font-bold text-sm text-on-surface">
              {view === 'product' ? 'Top 20 Products by Revenue' : 'Revenue by Category'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
                <tr>
                  <th className="text-left px-5 py-3">#</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-right px-4 py-3">Units Sold</th>
                  <th className="text-right px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {view === 'product'
                  ? (productSales as { productId: string; _sum: { qty: number | null; price: { toNumber: () => number } | null }; _count: { id: number } }[]).map((p, i) => {
                      const prod = productMap[p.productId]
                      return (
                        <tr key={p.productId} className="hover:bg-surface-container/50 transition-colors">
                          <td className="px-5 py-3 text-xs text-on-surface-variant font-bold">{i + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-on-surface text-xs">{prod?.name ?? 'Unknown'}</p>
                            {prod?.model && <p className="text-[10px] text-on-surface-variant">{prod.model}</p>}
                          </td>
                          <td className="px-4 py-3 text-right text-on-surface">{p._sum.qty ?? 0}</td>
                          <td className="px-4 py-3 text-right font-bold text-on-surface">{formatPrice(Number(p._sum.price ?? 0))}</td>
                        </tr>
                      )
                    })
                  : (categorySales as { categoryName: string; total: number; units: number }[]).map((c, i) => (
                      <tr key={c.categoryName} className="hover:bg-surface-container/50 transition-colors">
                        <td className="px-5 py-3 text-xs text-on-surface-variant font-bold">{i + 1}</td>
                        <td className="px-4 py-3 font-bold text-on-surface text-xs">{c.categoryName}</td>
                        <td className="px-4 py-3 text-right text-on-surface">{c.units}</td>
                        <td className="px-4 py-3 text-right font-bold text-on-surface">{formatPrice(c.total)}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-6">
          {/* Payment breakdown */}
          <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container">
              <h2 className="font-bold text-sm text-on-surface">Payment Modes</h2>
            </div>
            <div className="p-4 space-y-3">
              {(paymentBreakdown as { paymentMode: string; _count: { id: number }; _sum: { totalAmount: { toNumber?: () => number } | null } }[]).map((p) => {
                const amount = Number(p._sum.totalAmount ?? 0)
                const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
                return (
                  <div key={p.paymentMode}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-on-surface">{p.paymentMode}</span>
                      <span className="text-xs text-on-surface-variant">{p._count.id} sales · {pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs font-bold text-primary mt-1">{formatPrice(amount)}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top customers */}
          <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container">
              <h2 className="font-bold text-sm text-on-surface">Top Customers</h2>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {(topCustomers as { customerName: string | null; _count: { id: number }; _sum: { totalAmount: { toNumber?: () => number } | null } }[]).map((c, i) => (
                <div key={c.customerName ?? i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-on-surface">{c.customerName ?? 'Walk-in'}</p>
                    <p className="text-[10px] text-on-surface-variant">{c._count.id} orders</p>
                  </div>
                  <p className="text-xs font-bold text-primary">{formatPrice(Number(c._sum.totalAmount ?? 0))}</p>
                </div>
              ))}
              {(topCustomers as unknown[]).length === 0 && (
                <p className="px-5 py-8 text-xs text-on-surface-variant text-center">No sales data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
