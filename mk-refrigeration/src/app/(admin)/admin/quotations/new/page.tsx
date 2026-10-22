import { prisma } from '@/lib/db'
import NewQuotationClient from './_client'

export const dynamic = 'force-dynamic'

export default async function NewQuotationPage() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, price: true, mrp: true, model: true, brand: { select: { name: true } } },
  }).then((ps) => ps.map((p) => ({ ...p, price: Number(p.price), mrp: p.mrp ? Number(p.mrp) : null }))).catch(() => [])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <nav className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
          <a href="/admin/quotations" className="hover:text-primary transition-colors">Quotations</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">New</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Create Quotation</h1>
      </div>
      <NewQuotationClient products={products} />
    </div>
  )
}
