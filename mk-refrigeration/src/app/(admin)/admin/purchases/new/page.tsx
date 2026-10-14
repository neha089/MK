import { prisma } from '@/lib/db'
import NewPurchaseClient from './_client'

export const dynamic = 'force-dynamic'

export default async function NewPurchasePage() {
  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, model: true, brand: { select: { name: true } } },
    }).catch(() => []),
    prisma.supplier.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/purchases" className="hover:text-primary transition-colors">Purchases</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">New Inload</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Record Purchase / Inload</h1>
        <p className="text-on-surface-variant text-sm mt-1">Add stock received from supplier</p>
      </div>
      <NewPurchaseClient products={products} suppliers={suppliers} />
    </div>
  )
}
