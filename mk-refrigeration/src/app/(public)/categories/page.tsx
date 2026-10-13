import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { CATEGORIES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'All Categories | AC, Fridge, Washing Machine & More',
  description: 'Browse all product categories at MK Refrigeration, Bharuch — AC, Refrigerators, Washing Machines, Deep Freezers, Air Coolers and Home Appliances.',
}

async function getCategoriesWithCount() {
  try {
    return await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { products: { where: { inStock: true } } } } },
    })
  } catch {
    return []
  }
}

export default async function CategoriesPage() {
  const dbCats = await getCategoriesWithCount()
  const items = dbCats.length > 0
    ? dbCats.map((c) => ({ name: c.name, slug: c.slug, icon: c.icon ?? 'devices_other', description: c.description ?? '', count: c._count.products }))
    : CATEGORIES.map((c) => ({ ...c, count: 0 }))

  return (
    <div className="py-16 px-margin-desktop max-w-container-max mx-auto">
      <div className="mb-10">
        <nav className="text-xs text-on-surface-variant mb-4 flex items-center gap-1">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">Categories</span>
        </nav>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface">All Categories</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          Find the right appliance for your home or business. All brands available.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        {items.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-outline-variant/40 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span
                className="material-symbols-outlined text-4xl text-primary group-hover:text-on-primary transition-colors"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {cat.icon}
              </span>
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-on-surface leading-tight">{cat.name}</p>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-tight">{cat.description}</p>
              {cat.count > 0 && (
                <p className="text-xs text-primary font-bold mt-1">{cat.count} products</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
