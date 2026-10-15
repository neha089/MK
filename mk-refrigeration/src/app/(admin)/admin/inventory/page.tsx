import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { adjustStock } from '@/actions/inventory'
import InventoryClient from './_client'

export const metadata: Metadata = { title: 'Inventory' }
export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const [products, logs] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, model: true, stockQty: true, inStock: true, brand: { select: { name: true } }, category: { select: { name: true } } },
    }).catch(() => []),
    prisma.inventoryLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { product: { select: { name: true } } },
    }).catch(() => []),
  ])

  const lowStock = products.filter((p) => p.stockQty <= 2)

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-extrabold text-on-surface">Inventory</h1>

      {lowStock.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex gap-3 items-start">
          <span className="material-symbols-outlined text-warning mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <div>
            <p className="font-bold text-on-surface text-sm">Low Stock Alert</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{lowStock.map((p) => p.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container flex items-center justify-between">
          <h2 className="font-bold text-sm text-on-surface">Stock Levels</h2>
          <p className="text-xs text-on-surface-variant">Hover a row to adjust stock</p>
        </div>
        <InventoryClient products={products} action={adjustStock} />
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container">
          <h2 className="font-bold text-sm text-on-surface">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container/50 border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-center px-4 py-3">Type</th>
                <th className="text-center px-4 py-3">Qty</th>
                <th className="text-left px-4 py-3">Note</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-on-surface">{l.product.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${l.type === 'IN' ? 'bg-success/10 text-success border-success/20' : l.type === 'OUT' ? 'bg-error/10 text-error border-error/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-on-surface">{l.qty}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{l.note ?? '—'}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-on-surface-variant">No activity yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
