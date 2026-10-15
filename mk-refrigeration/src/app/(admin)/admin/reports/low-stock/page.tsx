import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Low Stock Report' }
export const dynamic = 'force-dynamic'

export default async function LowStockPage() {
  const products = await prisma.product.findMany({
    where: { OR: [{ stockQty: { lte: 3 } }, { inStock: false }] },
    orderBy: [{ stockQty: 'asc' }, { name: 'asc' }],
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  }).catch(() => [])

  const outOfStock = products.filter((p) => p.stockQty === 0)
  const criticalStock = products.filter((p) => p.stockQty === 1)
  const lowStock = products.filter((p) => p.stockQty >= 2 && p.stockQty <= 3)

  return (
    <div className="space-y-6">
      <div>
        <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
          <Link href="/admin/reports" className="hover:text-primary transition-colors">Reports</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Low Stock</span>
        </nav>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Low Stock Alert</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Products with ≤ 3 units or marked out of stock</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-error/30 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Out of Stock</p>
          <p className="text-3xl font-extrabold font-headline text-error">{outOfStock.length}</p>
          <p className="text-xs text-on-surface-variant mt-1">0 units</p>
        </div>
        <div className="bg-white rounded-2xl border border-warning/30 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Critical (1 unit)</p>
          <p className="text-3xl font-extrabold font-headline text-warning">{criticalStock.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Low (2–3 units)</p>
          <p className="text-3xl font-extrabold font-headline text-on-surface">{lowStock.length}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-16 text-center">
          <span className="material-symbols-outlined text-4xl text-success mb-3 block">check_circle</span>
          <p className="font-bold text-on-surface">All products are well stocked!</p>
          <p className="text-sm text-on-surface-variant mt-1">No items below the threshold of 4 units.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
                <tr>
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
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-on-surface">{p.name}</p>
                      {p.model && <p className="text-xs text-on-surface-variant">{p.model}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-on-surface-variant text-xs">{p.brand.name}</td>
                    <td className="px-4 py-3.5 text-on-surface-variant text-xs">{p.category.name}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm">{formatPrice(Number(p.price))}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        p.stockQty === 0 ? 'bg-error/10 text-error' : p.stockQty === 1 ? 'bg-warning/10 text-warning' : 'bg-surface-container text-on-surface'
                      }`}>
                        {p.stockQty}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {p.stockQty === 0
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20">Out of stock</span>
                        : p.stockQty === 1
                          ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">Critical</span>
                          : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">Low</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                        title="Edit product"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
