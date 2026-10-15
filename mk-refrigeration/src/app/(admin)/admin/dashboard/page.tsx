import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import SalesChart from '@/components/admin/SalesChart'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const [products, enquiries, sales, lowStock] = await Promise.all([
      prisma.product.count(),
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.product.count({ where: { stockQty: { lte: 2 }, inStock: true } }),
    ])
    return {
      products,
      enquiries,
      monthlySales: Number(sales._sum.totalAmount ?? 0),
      lowStock,
    }
  } catch {
    return { products: 0, enquiries: 0, monthlySales: 0, lowStock: 0 }
  }
}

async function getMonthlySales() {
  try {
    const months = 6
    const start = new Date()
    start.setMonth(start.getMonth() - months + 1)
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start } },
      select: { totalAmount: true, createdAt: true },
    })

    const map: Record<string, number> = {}
    for (let i = 0; i < months; i++) {
      const d = new Date()
      d.setMonth(d.getMonth() - (months - 1 - i))
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map[key] = 0
    }
    for (const s of sales) {
      const key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (key in map) map[key] += Number(s.totalAmount)
    }

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return Object.entries(map).map(([key, total]) => {
      const [y, m] = key.split('-')
      return { month: `${MONTHS[Number(m) - 1]} ${y.slice(-2)}`, total }
    })
  } catch {
    return []
  }
}

const STAT_CARDS = [
  { label: 'Total Products', key: 'products', icon: 'inventory_2', color: 'bg-blue-50 text-blue-600', href: '/admin/products' },
  { label: 'New Enquiries', key: 'enquiries', icon: 'contact_mail', color: 'bg-amber-50 text-amber-600', href: '/admin/enquiries' },
  { label: 'This Month Sales', key: 'monthlySales', icon: 'payments', color: 'bg-emerald-50 text-emerald-600', currency: true, href: '/admin/sales' },
  { label: 'Low Stock Items', key: 'lowStock', icon: 'warning', color: 'bg-red-50 text-red-500', href: '/admin/inventory' },
]

const QUICK_LINKS = [
  { label: 'Add Product', href: '/admin/products/new', icon: 'add_box' },
  { label: 'Add Supplier', href: '/admin/suppliers', icon: 'local_shipping' },
  { label: 'New Purchase', href: '/admin/purchases/new', icon: 'shopping_cart' },
  { label: 'Create Bill', href: '/admin/sales/new', icon: 'receipt_long' },
  { label: 'New Quotation', href: '/admin/quotations/new', icon: 'request_quote' },
  { label: 'Manage Offers', href: '/admin/offers', icon: 'local_offer' },
]

async function getTopSellers() {
  try {
    const grouped = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { qty: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 5,
    })
    if (!grouped.length) return []
    const ids = grouped.map((g) => g.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, model: true, brand: { select: { name: true } } },
    })
    const map = new Map(products.map((p) => [p.id, p]))
    return grouped
      .filter((g) => map.has(g.productId))
      .map((g) => ({ product: map.get(g.productId)!, unitsSold: g._sum.qty ?? 0 }))
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const [stats, chartData, topSellers] = await Promise.all([getStats(), getMonthlySales(), getTopSellers()])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant text-sm mt-1">Welcome back. Here is your business overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white rounded-2xl border border-outline-variant/40 p-5 flex items-start gap-3 hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {card.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider truncate">{card.label}</p>
              <p className="font-headline text-xl font-extrabold text-on-surface mt-0.5">
                {card.currency
                  ? formatPrice(stats[card.key as keyof typeof stats] as number)
                  : stats[card.key as keyof typeof stats]}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Sales chart */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-headline font-bold text-on-surface">Monthly Sales</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Last 6 months — total billing amount</p>
          </div>
          <Link href="/admin/sales" className="text-xs font-bold text-primary hover:underline">
            View all →
          </Link>
        </div>
        <SalesChart data={chartData} />
      </div>

      {/* Top Sellers */}
      {topSellers.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-headline font-bold text-on-surface">Top Sellers</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Best-selling products by units sold</p>
            </div>
            <Link href="/admin/products" className="text-xs font-bold text-primary hover:underline">
              All products →
            </Link>
          </div>
          <div className="space-y-3">
            {topSellers.map((item, i) => {
              const maxUnits = topSellers[0]?.unitsSold ?? 1
              const pct = Math.round((item.unitsSold / maxUnits) * 100)
              return (
                <div key={item.product.id} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-extrabold text-on-surface-variant text-right flex-shrink-0">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-on-surface truncate">{item.product.name}</p>
                      <span className="text-xs font-extrabold text-primary ml-2 flex-shrink-0">
                        {item.unitsSold} sold
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-headline font-bold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-outline-variant/40 hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <span
                className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {link.icon}
              </span>
              <span className="text-xs font-bold text-on-surface text-center leading-tight">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
