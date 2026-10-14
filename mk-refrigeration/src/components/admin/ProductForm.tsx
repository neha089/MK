'use client'

import { useActionState } from 'react'
import type { ProductFormState } from '@/actions/products'

type Brand = { id: string; name: string }
type Category = { id: string; name: string }
type Product = {
  id: string; name: string; model: string | null; capacity: string | null; starRating: string | null
  description: string | null; price: number; mrp: number | null; featured: boolean; inStock: boolean
  stockQty: number; barcode: string | null; brandId: string; categoryId: string; images: string[]
}

type Props = {
  brands: Brand[]
  categories: Category[]
  product?: Product
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>
}

export default function ProductForm({ brands, categories, product, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const err = (field: string) => state?.fieldErrors?.[field]?.[0]

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-5">
        <h3 className="font-bold text-sm text-on-surface">Product Details</h3>

        <div>
          <label className="label-xs">Product Name *</label>
          <input name="name" required defaultValue={product?.name} className="input-field" placeholder="LG 1.5 Ton 5 Star Inverter Split AC" />
          {err('name') && <p className="text-xs text-error mt-1">{err('name')}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Brand *</label>
            <select name="brandId" required defaultValue={product?.brandId} className="input-field">
              <option value="">Select Brand</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-xs">Category *</label>
            <select name="categoryId" required defaultValue={product?.categoryId} className="input-field">
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label-xs">Model No.</label>
            <input name="model" defaultValue={product?.model ?? ''} className="input-field" placeholder="LS-Q18HNZA" />
          </div>
          <div>
            <label className="label-xs">Capacity</label>
            <input name="capacity" defaultValue={product?.capacity ?? ''} className="input-field" placeholder="1.5 Ton" />
          </div>
          <div>
            <label className="label-xs">Star Rating</label>
            <input name="starRating" defaultValue={product?.starRating ?? ''} className="input-field" placeholder="5 Star" />
          </div>
        </div>

        <div>
          <label className="label-xs">Description</label>
          <textarea name="description" rows={3} defaultValue={product?.description ?? ''} className="input-field resize-none" placeholder="Key features and specs..." />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6 space-y-5">
        <h3 className="font-bold text-sm text-on-surface">Pricing & Stock</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Selling Price (₹) *</label>
            <input name="price" type="number" step="0.01" required defaultValue={product?.price} className="input-field" placeholder="35000" />
            {err('price') && <p className="text-xs text-error mt-1">{err('price')}</p>}
          </div>
          <div>
            <label className="label-xs">MRP (₹)</label>
            <input name="mrp" type="number" step="0.01" defaultValue={product?.mrp ?? ''} className="input-field" placeholder="42000" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-xs">Stock Quantity</label>
            <input name="stockQty" type="number" min={0} defaultValue={product?.stockQty ?? 0} className="input-field" />
          </div>
          <div>
            <label className="label-xs">Barcode / Serial</label>
            <input name="barcode" defaultValue={product?.barcode ?? ''} className="input-field" placeholder="Scan or enter barcode" />
          </div>
        </div>
        <div>
          <label className="label-xs">Image URL</label>
          <input name="imageUrl" type="url" defaultValue={product?.images?.[0] ?? ''} className="input-field" placeholder="https://..." />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="featured" defaultChecked={product?.featured} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-semibold text-on-surface">Featured on homepage</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="inStock" defaultChecked={product?.inStock ?? true} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-semibold text-on-surface">In Stock</span>
          </label>
        </div>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 bg-error/10 text-error border border-error/20 rounded-xl px-4 py-3 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-lg">save</span>}
          {product ? 'Update Product' : 'Create Product'}
        </button>
        <a href="/admin/products" className="flex items-center gap-2 border border-outline-variant/60 text-on-surface-variant font-bold px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">
          Cancel
        </a>
      </div>
    </form>
  )
}
