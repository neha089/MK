import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Inventory Valuation Report' }
export const dynamic = 'force-dynamic'

export default async function InventoryValuationPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  }).catch(() => [])

  const rows = products.map((p) => {
    const price = Number(p.price)
    const value = price * p.stockQty
    return { ...p, priceNum: price, value }
  })

  const totalValue = rows.reduce((s, r) => s + r.value, 0)
  const totalUnits = rows.reduce((s, r) => s + r.stockQty, 0)
  const inStockCount = rows.filter((r) => r.inStock && r.stockQty > 0).length
  const outOfStockCount = rows.filter((r) => r.stockQty === 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
            <Link href="/admin/reports" className="hover:text-primary transition-colors">Reports</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span>Inventory Valuation</span>
          </nav>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Inventory Valuation</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Valued at current selling price · {products.length} products</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Total Inventory Value</p>
          <p className="text-2xl font-extrabold font-headline text-primary">{formatPrice(totalValue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Total Units in Stock</p>
          <p className="text-2xl font-extrabold font-headline text-on-surface">{totalUnits.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Products In Stock</p>
          <p className="text-2xl font-extrabold font-headline text-success">{inStockCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <p className="text-xs text-on-surface-variant font-medium mb-1">Out of Stock</p>
          <p className="text-2xl font-extrabold font-headline text-error">{outOfStockCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Product</th>
                <th className="text-left px-4 py-3.5">Brand</th>
                <th className="text-left px-4 py-3.5">Category</th>
                <th className="text-right px-4 py-3.5">Price</th>
                <th className="text-right px-4 py-3.5">Qty</th>
                <th className="text-right px-4 py-3.5">Value</th>
                <th className="text-center px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {rows.map((r) => (
                <tr key={r.id} className={`hover:bg-surface-container/50 transition-colors ${r.stockQty === 0 ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-on-surface">{r.name}</p>
                    {r.model && <p className="text-xs text-on-surface-variant">{r.model}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">{r.brand.name}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant text-xs">{r.category.name}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm">{formatPrice(r.priceNum)}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-on-surface">{r.stockQty}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-on-surface">{formatPrice(r.value)}</td>
                  <td className="px-4 py-3.5 text-center">
                    {r.stockQty === 0
                      ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20">Out of stock</span>
                      : r.stockQty <= 2
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">Low stock</span>
                        : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">In stock</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-container border-t border-outline-variant/40">
              <tr>
                <td colSpan={4} className="px-5 py-3.5 font-bold text-on-surface text-xs uppercase tracking-wider">Total</td>
                <td className="px-4 py-3.5 text-right font-bold text-on-surface">{totalUnits}</td>
                <td className="px-4 py-3.5 text-right font-bold text-primary">{formatPrice(totalValue)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
