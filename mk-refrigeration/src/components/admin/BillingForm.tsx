'use client'

import { useState, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'

type Product = { id: string; name: string; price: number; mrp: number | null; model: string | null; brand: { name: string } | null }
type LineItem = { productId: string; name: string; qty: number; price: number; discount: number }

type Props = {
  products: Product[]
  mode: 'sale' | 'quotation'
  action: (formData: FormData) => void
  pending: boolean
  error?: string
}

export default function BillingForm({ products, mode, action, pending, error }: Props) {
  const [items, setItems] = useState<LineItem[]>([])
  const [search, setSearch] = useState('')

  const filtered = search.length > 1
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.name.toLowerCase().includes(search.toLowerCase()))
    : []

  const addItem = useCallback((p: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id)
      if (existing) return prev.map((i) => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { productId: p.id, name: p.name, qty: 1, price: p.price, discount: 0 }]
    })
    setSearch('')
  }, [])

  const updateItem = (productId: string, field: 'qty' | 'price' | 'discount', value: number) => {
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, [field]: value } : i))
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const discountTotal = items.reduce((s, i) => s + i.discount, 0)
  const total = subtotal - discountTotal

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) return
    const fd = new FormData(e.currentTarget)
    fd.set('items', JSON.stringify(items))
    action(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-4">
        <h3 className="font-bold text-sm text-on-surface">Customer Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Customer Name *</label>
            <input name="customerName" required placeholder="Rahul Patel" className="input-field" />
          </div>
          <div>
            <label className="label-xs">Phone Number</label>
            <input name="customerPhone" type="tel" placeholder="98XXXXXXXX" className="input-field" />
          </div>
        </div>
        {mode === 'quotation' && (
          <div>
            <label className="label-xs">Valid for (days)</label>
            <input name="validDays" type="number" defaultValue={7} min={1} max={90} className="input-field w-32" />
          </div>
        )}
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
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container text-left transition-colors border-b border-outline-variant/20 last:border-0"
                >
                  <div>
                    <p className="text-sm font-bold text-on-surface">{p.name}</p>
                    <p className="text-xs text-on-surface-variant">{p.brand?.name} {p.model && `• ${p.model}`}</p>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0 ml-4">{formatPrice(p.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Line items */}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
                  <th className="text-left py-2 pr-4">Product</th>
                  <th className="text-right py-2 px-3 w-20">Qty</th>
                  <th className="text-right py-2 px-3 w-28">Price (₹)</th>
                  <th className="text-right py-2 px-3 w-28">Discount (₹)</th>
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
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => updateItem(item.productId, 'qty', Number(e.target.value))}
                        className="w-16 text-right border border-outline-variant/60 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price}
                        onChange={(e) => updateItem(item.productId, 'price', Number(e.target.value))}
                        className="w-24 text-right border border-outline-variant/60 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.discount}
                        onChange={(e) => updateItem(item.productId, 'discount', Number(e.target.value))}
                        className="w-24 text-right border border-outline-variant/60 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary"
                      />
                    </td>
                    <td className="py-2 pl-3 text-right font-bold text-on-surface">
                      {formatPrice(item.qty * item.price - item.discount)}
                    </td>
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

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
        <label className="label-xs">Notes (optional)</label>
        <textarea name="notes" rows={2} placeholder="Any additional notes..." className="input-field mt-1 resize-none" />
      </div>

      {/* Totals */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
          <div className="space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span className="font-bold text-on-surface">{formatPrice(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-error">
                <span>Discount</span>
                <span className="font-bold">-{formatPrice(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-base pt-2 border-t border-outline-variant/40">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
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
          {pending ? (
            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              {mode === 'sale' ? 'receipt_long' : 'request_quote'}
            </span>
          )}
          {mode === 'sale' ? 'Create Bill' : 'Create Quotation'}
        </button>
        <a href={`/admin/${mode === 'sale' ? 'sales' : 'quotations'}`} className="flex items-center gap-2 border border-outline-variant/60 text-on-surface-variant font-bold px-6 py-3 rounded-xl hover:bg-surface-container transition-colors">
          Cancel
        </a>
      </div>
    </form>
  )
}
