'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'

type Product = { id: string; name: string; model: string | null; brand: { name: string } | null }
type Supplier = { id: string; name: string }
type LineItem = { productId: string; name: string; qty: number; costPrice: number }

type Props = {
  products: Product[]
  suppliers: Supplier[]
  action: (formData: FormData) => void
  pending: boolean
  error?: string
}

export default function PurchaseForm({ products, suppliers, action, pending, error }: Props) {
  const [items, setItems] = useState<LineItem[]>([])
  const [search, setSearch] = useState('')

  const filtered = search.length > 1
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.name.toLowerCase().includes(search.toLowerCase()))
    : []

  const addItem = (p: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id)
      if (existing) return prev.map((i) => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { productId: p.id, name: p.name, qty: 1, costPrice: 0 }]
    })
    setSearch('')
  }

  const updateItem = (productId: string, field: 'qty' | 'costPrice', value: number) => {
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, [field]: value } : i))
  }

  const removeItem = (productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId))

  const total = items.reduce((s, i) => s + i.qty * i.costPrice, 0)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) return
    const fd = new FormData(e.currentTarget)
    fd.set('items', JSON.stringify(items))
    action(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Supplier */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-4">
        <h3 className="font-bold text-sm text-on-surface">Supplier (optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Select Supplier</label>
            <select name="supplierId" className="input-field">
              <option value="">— None —</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Product search */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-4">
        <h3 className="font-bold text-sm text-on-surface">Add Products</h3>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or brand..."
            className="input-field pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
          {filtered.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-white border border-outline-variant/60 rounded-xl shadow-lg max-h-56 overflow-y-auto">
              {filtered.slice(0, 8).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => addItem(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container text-left transition-colors border-b border-outline-variant/20 last:border-0"
                >
                  <div>
                    <p className="text-sm font-bold text-on-surface">{p.name}</p>
                    <p className="text-xs text-on-surface-variant">{p.brand?.name} {p.model && `• ${p.model}`}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
                  <th className="text-left py-2 pr-4">Product</th>
                  <th className="text-right py-2 px-3 w-20">Qty</th>
                  <th className="text-right py-2 px-3 w-32">Cost Price (₹)</th>
                  <th className="text-right py-2 pl-3 w-28">Amount</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId} className="border-b border-outline-variant/20">
                    <td className="py-2 pr-4 font-medium text-on-surface">{item.name}</td>
                    <td className="py-2 px-3">
                      <input
                        type="number" min={1} value={item.qty}
                        onChange={(e) => updateItem(item.productId, 'qty', Number(e.target.value))}
                        className="w-16 text-right border border-outline-variant/60 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number" min={0} step={0.01} value={item.costPrice}
                        onChange={(e) => updateItem(item.productId, 'costPrice', Number(e.target.value))}
                        className="w-28 text-right border border-outline-variant/60 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary"
                      />
                    </td>
                    <td className="py-2 pl-3 text-right font-bold text-on-surface">{formatPrice(item.qty * item.costPrice)}</td>
                    <td className="py-2">
                      <button type="button" onClick={() => removeItem(item.productId)} className="text-error hover:bg-error/10 p-1 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
        <label className="label-xs">Notes (optional)</label>
        <textarea name="notes" rows={2} placeholder="Supplier invoice number, delivery details..." className="input-field mt-1 resize-none" />
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-5">
          <div className="flex justify-between font-extrabold text-base">
            <span className="text-on-surface">Total Cost</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-error/10 text-error border border-error/20 rounded-xl px-4 py-3 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || items.length === 0}
          className="flex items-center gap-2 bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
        >
          {pending
            ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            : <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>inventory</span>}
          Record Purchase
        </button>
        <a href="/admin/purchases" className="flex items-center gap-2 border border-outline-variant/60 text-on-surface-variant font-bold px-6 py-3 rounded-xl hover:bg-surface-container transition-colors">
          Cancel
        </a>
      </div>
    </form>
  )
}
