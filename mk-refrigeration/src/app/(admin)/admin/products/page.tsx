import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { toggleStock, deleteProduct } from '@/actions/products'

export const metadata: Metadata = { title: 'Products' }
export const dynamic = 'force-dynamic'

async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: { brand: true, category: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch { return [] }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Products</h1>
          <p className="text-on-surface-variant text-sm mt-1">{products.length} products in catalogue</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <span className="material-symbols-outlined text-xl">add</span>
          Add Product
        </Link>
      </div>

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
                    No products yet.{' '}
                    <Link href="/admin/products/new" className="text-primary font-bold">Add one</Link>
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
