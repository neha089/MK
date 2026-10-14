import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { deleteBrand } from '@/actions/brands'

export const metadata: Metadata = { title: 'Brands' }
export const dynamic = 'force-dynamic'

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  }).catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Brands</h1>
        <Link href="/admin/brands/new" className="btn-primary">
          <span className="material-symbols-outlined text-xl">add</span>
          Add Brand
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {brands.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-outline-variant/40 p-5 flex items-center justify-between gap-3">
            <div>
              <p className="font-extrabold text-on-surface">{b.name}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{b._count.products} products</p>
              {b.featured && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">Featured</span>}
            </div>
            <form action={deleteBrand.bind(null, b.id)}>
              <button type="submit"
                onClick={(e) => { if (!confirm('Delete brand?')) e.preventDefault() }}
                className="p-1.5 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </form>
          </div>
        ))}
        {brands.length === 0 && (
          <div className="col-span-4 text-center py-12 text-on-surface-variant">
            No brands yet. <Link href="/admin/brands/new" className="text-primary font-bold">Add one</Link>
          </div>
        )}
      </div>
    </div>
  )
}
