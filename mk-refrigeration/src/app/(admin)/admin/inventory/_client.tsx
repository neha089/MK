'use client'

import { useState, useEffect, useActionState } from 'react'
import type { AdjustState } from '@/actions/inventory'

type Product = {
  id: string
  name: string
  model: string | null
  stockQty: number
  inStock: boolean
  brand: { name: string } | null
  category: { name: string } | null
}

type RowProps = {
  product: Product
  action: (state: AdjustState, formData: FormData) => Promise<AdjustState>
}

function StockAdjustRow({ product: p, action }: RowProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(action, undefined)
  const err = (f: string) => state?.fieldErrors?.[f]?.[0]

  useEffect(() => {
    if (state?.success) setOpen(false)
  }, [state?.success])

  return (
    <>
      <tr className="hover:bg-surface-container/50 transition-colors group">
        <td className="px-5 py-3">
          <p className="font-bold text-on-surface">{p.name}</p>
          {p.model && <p className="text-xs text-on-surface-variant">{p.model}</p>}
        </td>
        <td className="px-4 py-3 text-on-surface-variant text-xs">{p.brand?.name ?? '—'}</td>
        <td className="px-4 py-3 text-on-surface-variant text-xs">{p.category?.name ?? '—'}</td>
        <td className="px-4 py-3 text-center">
          <span className={`font-extrabold text-base ${p.stockQty <= 2 ? 'text-error' : p.stockQty <= 5 ? 'text-amber-500' : 'text-on-surface'}`}>
            {p.stockQty}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          {p.inStock
            ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">In Stock</span>
            : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-error/10 text-error border border-error/20">Out of Stock</span>}
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${open ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/60 text-on-surface-variant hover:border-primary hover:text-primary opacity-0 group-hover:opacity-100'}`}
          >
            {open ? 'Cancel' : 'Adjust'}
          </button>
        </td>
      </tr>

      {open && (
        <tr className="bg-primary/3">
          <td colSpan={6} className="px-5 py-4">
            <form action={formAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="productId" value={p.id} />

              <div>
                <label className="label-xs">Type</label>
                <select name="type" className="input-field w-32 text-sm py-2">
                  <option value="IN">+ Add (IN)</option>
                  <option value="OUT">− Remove (OUT)</option>
                  <option value="ADJUST">= Set exact (ADJUST)</option>
                </select>
              </div>

              <div>
                <label className="label-xs">Qty</label>
                <input name="qty" type="number" min={1} defaultValue={1} className="input-field w-24 text-sm py-2" />
                {err('qty') && <p className="text-xs text-error mt-1">{err('qty')}</p>}
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className="label-xs">Note (optional)</label>
                <input name="note" className="input-field text-sm py-2" placeholder="e.g. Damaged, return, recount..." />
              </div>

              <button type="submit" disabled={pending} className="btn-primary py-2 text-sm disabled:opacity-50">
                {pending
                  ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  : <span className="material-symbols-outlined text-base">check</span>}
                Save
              </button>

              {state?.error && (
                <p className="w-full text-xs text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {state.error}
                </p>
              )}
            </form>
          </td>
        </tr>
      )}
    </>
  )
}

type ClientProps = {
  products: Product[]
  action: (state: AdjustState, formData: FormData) => Promise<AdjustState>
}

export default function InventoryClient({ products, action }: ClientProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface-container/50 border-b border-outline-variant/40 text-xs text-on-surface-variant uppercase tracking-wider">
          <tr>
            <th className="text-left px-5 py-3">Product</th>
            <th className="text-left px-4 py-3">Brand</th>
            <th className="text-left px-4 py-3">Category</th>
            <th className="text-center px-4 py-3">Qty</th>
            <th className="text-center px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {products.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant">No products found.</td></tr>
          ) : (
            products.map((p) => <StockAdjustRow key={p.id} product={p} action={action} />)
          )}
        </tbody>
      </table>
    </div>
  )
}
