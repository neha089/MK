import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SHOP } from '@/lib/constants'
import { formatPrice, discountPercent } from '@/lib/utils'

export const metadata: Metadata = {
  title: `All Products | ${SHOP.name} Bharuch`,
  description: `Browse all home appliances at ${SHOP.name}, Bharuch — AC, Refrigerators, Washing Machines, Deep Freezers and more. Best price, genuine warranty.`,
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ category?: string; brand?: string; q?: string; instock?: string }>

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, brand, q, instock } = await searchParams

  const where = {
    ...(category ? { categoryId: category } : {}),
    ...(brand ? { brandId: brand } : {}),
    ...(instock === '1' ? { inStock: true } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { model: { contains: q, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    }).catch(() => []),
    prisma.category.findMany({ orderBy: { order: 'asc' } }).catch(() => []),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
  ])

  const selectedCategory = categories.find((c) => c.id === category)
  const selectedBrand = brands.find((b) => b.id === brand)

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { category, brand, q, instock, ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    const s = params.toString()
    return `/products${s ? `?${s}` : ''}`
  }

  return (
    <div className="py-12">
      <div className="px-margin-desktop max-w-container-max mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-on-surface-variant mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          {selectedCategory ? (
            <>
              <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-on-surface font-semibold">{selectedCategory.name}</span>
            </>
          ) : selectedBrand ? (
            <>
              <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-on-surface font-semibold">{selectedBrand.name}</span>
            </>
          ) : (
            <span className="text-on-surface font-semibold">All Products</span>
          )}
        </nav>

        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface">
              {selectedCategory?.name ?? selectedBrand?.name ?? 'All Products'}
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">{products.length} products</p>
          </div>
          {/* Search */}
          <form method="GET" action="/products" className="hidden sm:flex items-center gap-2">
            {category && <input type="hidden" name="category" value={category} />}
            {brand && <input type="hidden" name="brand" value={brand} />}
            {instock && <input type="hidden" name="instock" value={instock} />}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search products..."
              className="border border-outline-variant/60 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
            />
            <button type="submit" className="p-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
          </form>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-52 shrink-0 space-y-6">
            {/* Stock filter */}
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Availability</p>
              <Link
                href={buildUrl({ instock: instock === '1' ? undefined : '1' })}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-colors ${instock === '1' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-base">inventory</span>
                In Stock Only
              </Link>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Category</p>
              <div className="space-y-0.5">
                <Link
                  href={buildUrl({ category: undefined })}
                  className={`block text-sm px-3 py-2 rounded-xl transition-colors ${!category ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  All Categories
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={buildUrl({ category: c.id })}
                    className={`block text-sm px-3 py-2 rounded-xl transition-colors ${category === c.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brand filter */}
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Brand</p>
              <div className="space-y-0.5">
                <Link
                  href={buildUrl({ brand: undefined })}
                  className={`block text-sm px-3 py-2 rounded-xl transition-colors ${!brand ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  All Brands
                </Link>
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={buildUrl({ brand: b.id })}
                    className={`block text-sm px-3 py-2 rounded-xl transition-colors ${brand === b.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter chips */}
            <div className="flex lg:hidden flex-wrap gap-2 mb-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={buildUrl({ category: category === c.id ? undefined : c.id })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${category === c.id ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-outline-variant/40 p-16 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 block mb-3">search_off</span>
                <p className="font-bold text-on-surface">No products found</p>
                <p className="text-sm text-on-surface-variant mt-1">Try adjusting your filters</p>
                <Link href="/products" className="mt-4 inline-block text-sm text-primary font-bold hover:underline">Clear filters</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => {
                  const disc = p.mrp ? discountPercent(Number(p.mrp), Number(p.price)) : p.discount
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="group bg-white rounded-2xl border border-outline-variant/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      {/* Image */}
                      <div className="aspect-square bg-surface-container flex items-center justify-center relative overflow-hidden">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
                        )}
                        {disc && disc > 0 && (
                          <span className="absolute top-2 right-2 bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">−{disc}%</span>
                        )}
                        {!p.inStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white text-on-surface text-[10px] font-bold px-2 py-1 rounded-lg">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-3 flex-1 flex flex-col">
                        <p className="text-[10px] text-on-surface-variant font-medium">{p.brand.name}</p>
                        <p className="font-bold text-on-surface text-sm leading-tight mt-0.5 line-clamp-2 flex-1">{p.name}</p>
                        {p.model && <p className="text-[10px] text-on-surface-variant mt-1">{p.model}</p>}
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="font-extrabold text-primary text-base">{formatPrice(Number(p.price))}</span>
                          {p.mrp && Number(p.mrp) > Number(p.price) && (
                            <span className="text-[10px] text-on-surface-variant line-through">{formatPrice(Number(p.mrp))}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
