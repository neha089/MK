import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Search Products' }
export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? '').trim()

  const products = query.length >= 2
    ? await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { brand: { name: { contains: query, mode: 'insensitive' } } },
            { category: { name: { contains: query, mode: 'insensitive' } } },
          ],
        },
        include: {
          brand: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { featured: 'desc' },
        take: 40,
      }).catch(() => [])
    : []

  return (
    <div className="py-12 px-margin-desktop max-w-container-max mx-auto">
      <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-semibold">Search</span>
      </nav>

      {/* Search header */}
      <div className="mb-8">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">
          {query ? `Results for "${query}"` : 'Search Products'}
        </h1>
        {query && (
          <p className="text-on-surface-variant text-sm mt-1">
            {products.length === 0
              ? 'No products found. Try a different search.'
              : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
          </p>
        )}
      </div>

      {/* Search box */}
      <form action="/search" method="GET" className="mb-10">
        <div className="flex gap-3 max-w-xl">
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search AC, Fridge, Washing Machine..."
            className="flex-1 px-4 py-3 bg-white border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all text-sm"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">search</span>
            Search
          </button>
        </div>
      </form>

      {/* Empty states */}
      {!query && (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>
            search
          </span>
          <p className="font-bold">Type at least 2 characters to search</p>
          <p className="text-sm mt-1">Search by product name, brand, model or category</p>
        </div>
      )}

      {query.length >= 2 && products.length === 0 && (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block">inventory_2</span>
          <p className="font-bold">No products found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-1">Try searching with a different keyword</p>
          <Link href="/categories" className="mt-4 inline-block text-primary font-bold text-sm hover:underline">
            Browse all categories →
          </Link>
        </div>
      )}

      {/* Results grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group"
            >
              {/* Image placeholder */}
              <div className="aspect-square bg-surface-container flex items-center justify-center">
                {p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">
                    inventory_2
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  {p.brand.name} · {p.category.name}
                </p>
                <h3 className="font-bold text-sm text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                {p.model && (
                  <p className="text-xs text-on-surface-variant mt-0.5">{p.model}</p>
                )}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-extrabold text-on-surface">{formatPrice(Number(p.price))}</span>
                  {p.mrp && Number(p.mrp) > Number(p.price) && (
                    <span className="text-xs text-on-surface-variant line-through">{formatPrice(Number(p.mrp))}</span>
                  )}
                </div>
                <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.inStock ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
