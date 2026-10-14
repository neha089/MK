import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

async function getStats() {
  try {
    const [products, enquiries, sales] = await Promise.all([
      prisma.product.count(),
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ])
    return { products, enquiries, monthlySales: Number(sales._sum.totalAmount ?? 0) }
  } catch {
    return { products: 0, enquiries: 0, monthlySales: 0 }
  }
}

const STAT_CARDS = [
  { label: 'Total Products', key: 'products', icon: 'inventory_2', color: 'bg-blue-50 text-blue-600' },
  { label: 'New Enquiries', key: 'enquiries', icon: 'contact_mail', color: 'bg-amber-50 text-amber-600' },
  { label: 'Monthly Sales', key: 'monthlySales', icon: 'payments', color: 'bg-emerald-50 text-emerald-600', currency: true },
]

const QUICK_LINKS = [
  { label: 'Add Product', href: '/admin/products/new', icon: 'add_box' },
  { label: 'New Purchase', href: '/admin/purchases/new', icon: 'shopping_cart' },
  { label: 'Create Bill', href: '/admin/sales/new', icon: 'receipt_long' },
  { label: 'New Quotation', href: '/admin/quotations/new', icon: 'request_quote' },
  { label: 'View Inventory', href: '/admin/inventory', icon: 'warehouse' },
  { label: 'Manage Offers', href: '/admin/offers', icon: 'local_offer' },
]

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant text-sm mt-1">Welcome back. Here is your business overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="bg-white rounded-2xl border border-outline-variant/40 p-6 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {card.icon}
              </span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{card.label}</p>
              <p className="font-headline text-2xl font-extrabold text-on-surface mt-0.5">
                {card.currency
                  ? formatPrice(stats[card.key as keyof typeof stats] as number)
                  : stats[card.key as keyof typeof stats]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-headline font-bold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
