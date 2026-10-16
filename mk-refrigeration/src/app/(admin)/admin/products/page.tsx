import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { toggleStock, deleteProduct } from '@/actions/products'
import ProductFilters from './_filters'

export const metadata: Metadata = { title: 'Products' }
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ category?: string; brand?: string; stock?: string; q?: string }>

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, brand, stock, q } = await searchParams

  const where = {
    ...(category ? { categoryId: category } : {}),
    ...(brand ? { brandId: brand } : {}),
    ...(stock === 'in' ? { inStock: true } : stock === 'out' ? { inStock: false } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { model: { contains: q, mode: 'insensitive' as const } },
        { barcode: { contains: q, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.category.findMany({ orderBy: { order: 'asc' } }).catch(() => []),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
  ])

  const activeFilters = [category, brand, stock, q].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Products</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''}
            {activeFilters > 0 && <span className="text-primary ml-1">(filtered)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/api/admin/export/products" className="flex items-center gap-1.5 shrink-0 border border-outline-variant/60 text-on-surface-variant font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </a>
          <Link href="/admin/products/new" className="btn-primary">
            <span className="material-symbols-outlined text-xl">add</span>
            Add Product
          </Link>
        </div>
      </div>

      <ProductFilters
        categories={categories}
        brands={brands}
        category={category}
        brand={brand}
        stock={stock}
        q={q}
      />

      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant/40">
              <tr className="text-xs text-on-surface-variant uppercase tracking-wider">
                <th className="text-left px-5 py-3.5">Product</th>
                <th className="text-left px-4 py-3.5">Brand</th>
                <th className="text-left px-4 py-3.5">Category</th>
                <th className="text-right px-4 py-3.5">Price</th>
                <th className="text-center px-4 py-3.5">Stock</th>
                <th className="text-center px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl block mb-2 opacity-30">inventory_2</span>
                    {activeFilters > 0 ? (
                      <>No products match your filters. <Link href="/admin/products" className="text-primary font-bold">Clear filters</Link></>
                    ) : (
                      <>No products yet. <Link href="/admin/products/new" className="text-primary font-bold">Add one</Link></>
                    )}
                  </td>
                </tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-bold text-on-surface line-clamp-1">{p.name}</p>
                      {p.model && <p className="text-xs text-on-surface-variant">{p.model}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-variant">{p.brand.name}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant">{p.category.name}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-on-surface">{formatPrice(Number(p.price))}</td>
                  <td className="px-4 py-3.5 text-center font-mono text-on-surface">{p.stockQty}</td>
                  <td className="px-4 py-3.5 text-center">
                    <form action={toggleStock.bind(null, p.id, !p.inStock)}>
                      <button type="submit" className={`text-xs font-bold px-3 py-1 rounded-full ${p.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-error/10 text-error'}`}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/products/${p.id}/label`} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors" title="Print labels">
                        <span className="material-symbols-outlined text-lg">label</span>
                      </Link>
                      <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <form action={deleteProduct.bind(null, p.id)}>
                        <button type="submit" className="p-1.5 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                          onClick={(e) => { if (!confirm('Delete this product?')) e.preventDefault() }}>
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
