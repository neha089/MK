import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const p = await prisma.product.findUnique({ where: { id }, select: { name: true } }).catch(() => null)
  return { title: p ? `${p.name}` : 'Product' }
}

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      saleItems: {
        orderBy: { sale: { createdAt: 'desc' } },
        take: 10,
        select: {
          qty: true,
          price: true,
          sale: { select: { id: true, createdAt: true, status: true } },
        },
      },
      inventoryLogs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { type: true, qty: true, note: true, createdAt: true },
      },
      _count: { select: { saleItems: true, purchaseItems: true } },
    },
  }).catch(() => null)

  if (!product) notFound()

  const totalSold = product.saleItems.reduce((s, i) => s + i.qty, 0)
  const revenue = product.saleItems.reduce((s, i) => s + i.qty * Number(i.price), 0)
  const specs = product.specs as Record<string, string> | null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant">
        <Link href="/admin/products" className="hover:text-primary transition-colors">Products</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-semibold line-clamp-1">{product.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold text-on-surface">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-on-surface-variant">{product.brand.name}</span>
              {product.model && <><span className="text-on-surface-variant">·</span><span className="text-sm text-on-surface-variant font-mono">{product.model}</span></>}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-error/10 text-error'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/admin/products/${product.id}/label`}
            className="flex items-center gap-1.5 border border-outline-variant/60 text-on-surface-variant font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-base">label</span>
            Label
          </Link>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex items-center gap-1.5 border border-primary/40 text-primary font-bold px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Selling Price', value: formatPrice(Number(product.price)), icon: 'sell' },
          { label: 'Stock Qty', value: product.stockQty, icon: 'inventory' },
          { label: 'Total Sold', value: `${product._count.saleItems} sales`, icon: 'shopping_cart' },
          { label: 'Revenue', value: formatPrice(revenue), icon: 'payments' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-outline-variant/40 p-4">
            <span className="material-symbols-outlined text-xl text-primary/60">{s.icon}</span>
            <p className="font-headline text-lg font-extrabold text-on-surface mt-1">{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-5 space-y-4">
        <h2 className="font-bold text-sm text-on-surface">Product Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-on-surface-variant">Category</p>
            <p className="font-semibold text-on-surface">{product.category.name}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">Brand</p>
            <p className="font-semibold text-on-surface">{product.brand.name}</p>
          </div>
          {product.mrp && (
            <div>
              <p className="text-xs text-on-surface-variant">MRP</p>
              <p className="font-semibold text-on-surface">{formatPrice(Number(product.mrp))}</p>
            </div>
          )}
          {product.capacity && (
            <div>
              <p className="text-xs text-on-surface-variant">Capacity</p>
              <p className="font-semibold text-on-surface">{product.capacity}</p>
            </div>
          )}
          {product.starRating && (
            <div>
              <p className="text-xs text-on-surface-variant">Star Rating</p>
              <p className="font-semibold text-on-surface">{product.starRating} ★</p>
            </div>
          )}
          {product.barcode && (
            <div>
              <p className="text-xs text-on-surface-variant">Barcode</p>
              <p className="font-semibold font-mono text-on-surface">{product.barcode}</p>
            </div>
          )}
          {product.discount && (
            <div>
              <p className="text-xs text-on-surface-variant">Discount</p>
              <p className="font-semibold text-on-surface">{product.discount}%</p>
            </div>
          )}
        </div>
        {product.description && (
          <div>
            <p className="text-xs text-on-surface-variant mb-1">Description</p>
            <p className="text-sm text-on-surface">{product.description}</p>
          </div>
        )}
        {specs && Object.keys(specs).length > 0 && (
          <div>
            <p className="text-xs text-on-surface-variant mb-2">Specifications</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs bg-surface-container/50 rounded-lg px-3 py-2">
                  <span className="text-on-surface-variant">{k}</span>
                  <span className="font-semibold text-on-surface">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/40 flex items-center justify-between">
          <h2 className="font-bold text-sm text-on-surface">Recent Sales</h2>
          <span className="text-xs text-on-surface-variant">{product._count.saleItems} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container text-xs text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Sale ID</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-center px-4 py-3">Qty</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {product.saleItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-on-surface-variant text-sm">No sales yet.</td>
                </tr>
              ) : product.saleItems.map((si, idx) => (
                <tr key={idx} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-on-surface">{si.sale.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">
                    {new Date(si.sale.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-on-surface">{si.qty}</td>
                  <td className="px-5 py-3 text-right font-bold text-on-surface">{formatPrice(Number(si.price))}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      si.sale.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                      si.sale.status === 'CANCELLED' ? 'bg-error/10 text-error' :
                      'bg-warning/10 text-warning'
                    }`}>{si.sale.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/sales/${si.sale.id}`} className="text-xs text-primary hover:underline font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Logs */}
      {product.inventoryLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/40">
            <h2 className="font-bold text-sm text-on-surface">Recent Inventory Changes</h2>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {product.inventoryLogs.map((log, idx) => (
              <div key={idx} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-base ${log.qty > 0 ? 'text-success' : 'text-error'}`}>
                    {log.qty > 0 ? 'add_circle' : 'remove_circle'}
                  </span>
                  <span className="text-on-surface-variant">{log.note ?? log.type}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`font-bold ${log.qty > 0 ? 'text-success' : 'text-error'}`}>
                    {log.qty > 0 ? '+' : ''}{log.qty}
                  </span>
                  <span className="text-on-surface-variant">{new Date(log.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
