import { prisma } from '@/lib/db'
import NewSaleClient from './_client'

export const dynamic = 'force-dynamic'

export default async function NewSalePage() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, price: true, mrp: true, model: true, brand: { select: { name: true } } },
  }).then((ps) => ps.map((p) => ({ ...p, price: Number(p.price), mrp: p.mrp ? Number(p.mrp) : null }))).catch(() => [])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/sales" className="hover:text-primary transition-colors">Sales</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">New Bill</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Create Bill</h1>
      </div>
      <NewSaleClient products={products} />
    </div>
  )
}
